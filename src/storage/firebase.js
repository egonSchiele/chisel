import { getFirestore } from "firebase-admin/firestore";
import * as Diff from "diff";
import admin from "firebase-admin";
import settings from "../../settings.js";
import serviceAccountKey from "../../serviceAccountKey.json" assert { type: "json" };
// const serviceAccountKey = await import(settings.firebaseServiceAccountKeyPath);
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey),
  });
} catch (e) {
  console.log(e);
}
const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

export const saveBook = async (book) => {
  console.log(`saving book ${book.bookid}`);

  if (!book) {
    console.log("no book to save");
    return;
  }

  book.created_at = Date.now();
  const docRef = db.collection("books").doc(book.bookid);
  try {
    await docRef.set(book);
    console.log("Successfully synced book to Firestore");
  } catch (error) {
    console.error("Error syncing book to Firestore:", error);
  }
};

export const getBook = async (bookid) => {
  console.log("getting book");
  console.log({ bookid });
  const bookRef = db.collection("books").doc(bookid);

  const chapterRef = db
    .collection("chapters")
    .where("bookid", "==", bookid);

  const [bookObj, chapters] = await Promise.all([bookRef.get(), chapterRef.get()]);

  if (!bookObj.exists) {
    return null;
  }

  const book = bookObj.data();
  book.chapters = [];

  if (chapters.empty) {
    console.log("No chapters found for this book.");
  } else {
    chapters.forEach((chapter) => {
      const data = chapter.data();
      book.chapters.push(data);
    });
  }
  return book;
};

export const deleteBook = async (bookid) => {
  console.log("deleting book");
  console.log({ bookid });

  const chapters = await db
    .collection("chapters")
    .where("bookid", "==", bookid)
    .get();

  if (chapters.empty) {
    console.log("No chapters found to delete.");
  } else {
    const batch = db.batch();
    chapters.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }

  const docRef = db.collection("books").doc(bookid);
  await docRef.delete();
};

export const getBooks = async (userid) => {
  console.log("getting books");

  const books = await db
    .collection("books")
    .where("userid", "==", userid)
    .get();

  if (books.empty) {
    console.log("No books found.");
    return [];
  }
  const allBooks = [];
  books.forEach(async (book) => {
    const data = book.data();
    if (!data.chapterTitles) {
      data.chapterTitles = data.chapters;
      data.chapters = [];
      await saveBook(data);
    }
    allBooks.push(data);
  });
  console.log(
    "allBooks",
    allBooks.map((book) => book.bookid),
  );
  return allBooks;
};

export const saveChapter = async (chapter) => {
  console.log(`saving chapter ${chapter.chapterid}`);

  if (!chapter) {
    console.log("no chapter to save");
    return;
  }

  if (
    settings.limits.chapterLength > 0
    && chapter.text
    && chapter.text.length >= settings.limits.chapterLength
  ) {
    throw new Error(
      `Chapter is too long. Limit: ${settings.limits.chapterLength}, your chapter: ${chapter.text.length}`,
    );
  }

  chapter.created_at = Date.now();
  const docRef = db.collection("chapters").doc(chapter.chapterid);
  try {
    await docRef.set(chapter);
    console.log("Successfully synced chapter to Firestore");
  } catch (error) {
    console.error("Error syncing chapter to Firestore:", error);
  }
};

export const getChapter = async (chapterid) => {
  console.log("getting chapter");
  console.log({ chapterid });
  const docRef = db.collection("chapters").doc(chapterid);
  const chapter = await docRef.get();
  if (!chapter.exists) {
    return null;
  }
  return chapter.data();
};

export const deleteChapter = async (chapterid, bookid) => {
  console.log("getting chapter");
  console.log({ chapterid });
  await db.collection("chapters").doc(chapterid).delete();
  const book = await getBook(bookid);
  if (!book) {
    console.log("no book to update");
    return;
  }
  book.chapterTitles = book.chapterTitles.filter(
    (chapter) => chapter.chapterid !== chapterid,
  );
  await saveBook(book);
};

export const favoriteChapter = async (chapterid) => {
  const chapter = await getChapter(chapterid);
  if (!chapter) {
    console.log("no chapter to favorite");
    return;
  }
  if (!chapter.favorite) {
    chapter.favorite = true;
  } else {
    chapter.favorite = !chapter.favorite;
  }

  await saveChapter(chapter);
};

export const favoriteBook = async (bookid) => {
  const book = await getBook(bookid);
  if (!book) {
    console.log("no book to favorite");
    return;
  }
  if (!book.favorite) {
    book.favorite = true;
  } else {
    book.favorite = !book.favorite;
  }

  await saveBook(book);
};

export const getHistory = async (chapterid) => {
  const docRef = db.collection("history").doc(chapterid);
  const bookObj = await docRef.get();
  if (!bookObj.exists) {
    return [];
  }
  return bookObj.data().history;
};

export const saveToHistory = async (chapterid, text) => {
  let docRef = db.collection("history").doc(chapterid);
  const bookObj = await docRef.get();

  if (!bookObj.exists) {
    const history = [text];
    const docRef = db.collection("history").doc(chapterid);
    await docRef.set({ history });
    return;
  }
  const { history } = bookObj.data();

  if (
    settings.limits.historyLength > 0
    && history.length >= settings.limits.historyLength
  ) {
    throw new Error(
      `History limit reached: ${settings.limits.historyLength}, ${chapterid}`,
    );
  }

  let old = history[0];
  history.slice(1).forEach((patch) => {
    old = Diff.applyPatch(old, patch);
  });

  // const old = history[history.length - 1];
  console.log("old", old);
  if (old === text) {
    console.log("no change");
    return;
  }
  const patch = Diff.createPatch(chapterid, old, text, "-", "-");
  console.log("patch", patch);
  history.push(patch);
  docRef = db.collection("history").doc(chapterid);
  await docRef.set({ history });
};
