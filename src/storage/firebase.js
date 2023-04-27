import { nanoid } from "nanoid";
import { getFirestore } from "firebase-admin/firestore";
import * as Diff from "diff";
import admin from "firebase-admin";
import settings from "../../settings.js";
import serviceAccountKey from "../../serviceAccountKey.json" assert { type: "json" };
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

  const [bookObj, chapters] = await Promise.all([
    bookRef.get(),
    getChaptersForBook(bookid),
  ]);

  if (!bookObj.exists) {
    return null;
  }

  const book = bookObj.data();
  book.chapters = chapters;
  return book;
};

export const getChaptersForBook = async (bookid) => {
  const chapterRef = db.collection("chapters").where("bookid", "==", bookid);

  const chapters = await chapterRef.get();
  if (chapters.empty) {
    console.log("No chapters found for this book.");
    return [];
  }
  const allChapters = [];
  chapters.forEach((chapter) => {
    allChapters.push(chapter.data());
  });
  return allChapters;
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

function asArray(snapshot) {
  const array = [];
  snapshot.forEach((doc) => {
    array.push(doc.data());
  });
  return array;
}

export const getBooks = async (userid) => {
  console.log("getting books");

  const books = await db
    .collection("books")
    .where("userid", "==", userid)
    .get();

  if (books.empty) {
    console.log("No books found.");
  }
  const allBooks = [];
  const promises = asArray(books).map(async (book) => {
    const chapters = await getChaptersForBook(book.bookid);
    book.chapters = chapters;
    if (book.chapterTitles) {
      book.chapterOrder = book.chapterTitles.map((c) => c.chapterid);
      delete book.chapterTitles;
    }
    allBooks.push(book);
  });
  await Promise.all(promises);
  console.log(
    "allBooks",
    allBooks.map((book) => book.bookid)
  );

  const compost = allBooks.find((book) => book.tag === "compost");
  if (!compost) {
    console.log("no compost book");
    const compostBook = makeNewBook({
      userid,
      tag: "compost",
      title: "Compost Heap",
    });

    const compostText =
      "This is a place to store all your random ideas, thoughts, and notes. Like a compost heap: https://austinkleon.com/2021/10/10/i-am-a-compost-heap/";
    const compostTitle = "Welcome to your compost heap!";
    const compostChapter = makeNewChapter(
      compostText,
      compostTitle,
      compostBook.bookid
    );
    await saveChapter(compostChapter);
    await saveBook(compostBook);

    compostBook.chapters = [compostChapter];
    compostBook.chapterOrder = [compostChapter.chapterid];

    allBooks.push(compostBook);
  }
  return allBooks;
};

export const saveChapter = async (chapter) => {
  console.log(`saving chapter ${chapter.chapterid}`);

  if (!chapter) {
    console.log("no chapter to save");
    return;
  }

  if (
    settings.limits.chapterLength > 0 &&
    chapter.text &&
    chapter.text.length >= settings.limits.chapterLength
  ) {
    throw new Error(
      `Chapter is too long. Limit: ${settings.limits.chapterLength}, your chapter: ${chapter.text.length}`
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
  if (!book.chapterOrder) {
    if (book.chapterTitles) {
      book.chapterOrder = book.chapterTitles.map((c) => c.chapterid);
      delete book.chapterTitles;
    }
  }
  if (book.chapterOrder) {
    book.chapterOrder = book.chapterOrder.filter(
      (_chapterid) => _chapterid !== chapterid
    );
  }
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
    settings.limits.historyLength > 0 &&
    history.length >= settings.limits.historyLength
  ) {
    throw new Error(
      `History limit reached: ${settings.limits.historyLength}, ${chapterid}`
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
  console.log("text", text);
  const patch = Diff.createPatch(chapterid, old, text, "-", "-");
  console.log("patch", patch);
  history.push(patch);
  docRef = db.collection("history").doc(chapterid);
  await docRef.set({ history });
};

export function makeNewBook(data = {}) {
  const bookid = nanoid();
  const book = {
    bookid,
    title: "Untitled",
    author: "Unknown",
    chapters: [],
    chapterOrder: [],
    columnHeadings: [],
    rowHeadings: [],
    synopsis: "",
    characters: [],
    genre: "",
    style: "",
    ...data,
  };
  return book;
}

export function makeNewChapter(text, title, bookid, data = {}) {
  const chapterid = nanoid();
  const chapter = {
    chapterid,
    title,
    bookid,
    text: [{ type: "plain", text, open: true }],
    pos: { x: 0, y: 0 },
    suggestions: [],
    favorite: false,
    ...data,
  };
  return chapter;
}

export const deleteBooks = async (userid) => {
  console.log("deleting books for user", userid);

  const books = await db
    .collection("books")
    .where("userid", "==", userid)
    .get();

  if (books.empty) {
    console.log("No books found to delete.");
  } else {
    const batch = db.batch();
    books.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }
};
