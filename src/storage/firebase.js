import _ from "lodash";
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

export function success(data = {}) {
  return { success: true, data };
}

export function failure(message) {
  return { success: false, message };
}

export const saveBook = async (book) => {
  console.log(`saving book ${book.bookid}`);

  if (!book) {
    console.log("no book to save");
    return;
  }

  const docRef = db.collection("books").doc(book.bookid);
  try {
    /* const doc = await docRef.get();
    if (doc.exists) {
      const data = doc.data();
      if (data.created_at && data.created_at > book.created_at) {
        return failure(
          `Could not save, your copy of this book is older than the one in the database. Db: ${data.created_at}, your copy: ${book.created_at}. Please refresh to get the latest updates, then try again.`
        );
      }
    } */
    book.created_at = Date.now();

    if (book.chapterOrder) {
      book.chapterOrder = _.uniq(book.chapterOrder);
    }

    await docRef.set(book);
    console.log("Successfully synced book to Firestore");
  } catch (error) {
    console.error("Error syncing book to Firestore:", error);
    return failure("Error saving book");
  }
  return success({ created_at: book.created_at });
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

export const getBookToCheckAccess = async (bookid) => {
  console.log("getting book");
  console.log({ bookid });
  const bookRef = db.collection("books").doc(bookid);
  const bookObj = await bookRef.get();
  const book = bookObj.data();
  return book;
};

export const getChaptersForBook = async (bookid, includeEmbeddings = false) => {
  const chapterRef = db.collection("chapters").where("bookid", "==", bookid);

  const chapters = await chapterRef.get();
  if (chapters.empty) {
    console.log("No chapters found for this book.");
    return [];
  }
  const allChapters = [];
  chapters.forEach((chapter) => {
    const chapterData = chapter.data();
    if (includeEmbeddings) {
      allChapters.push(chapterData);
    } else {
      if (chapterData.text && Array.isArray(chapterData.text)) {
        chapterData.text.forEach((t) => {
          t.embeddings = [];
        });
      }
      allChapters.push(chapterData);
    }
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

export const getBookTitles = async (userid) => {
  console.log("getting book titles");

  const _books = await db
    .collection("books")
    .where("userid", "==", userid)
    .get();

  const books = asArray(_books);
  const bookTitles = books.map((book) => {
    return { bookid: book.bookid, title: book.title, tag: book.tag };
  });
  return bookTitles;
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
  const promises = asArray(books).map(async (book) => {
    const chapters = await getChaptersForBook(book.bookid);

    book.chapters = chapters;
    if (book.chapterTitles) {
      book.chapterOrder = book.chapterTitles.map((c) => c.chapterid);
      delete book.chapterTitles;
    }
    book.chapterOrder = _.uniq(book.chapterOrder);
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
      "This is a place to store all your random ideas, thoughts, and notes. Like a compost heap: https://egonschiele.github.io/chisel-docs/docs/advanced-features/compost/";
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
    return failure("no chapter to save");
  }

  if (
    settings.limits.chapterLength > 0 &&
    chapter.text &&
    chapter.text.length >= settings.limits.chapterLength
  ) {
    return failure(
      `Chapter is too long. Limit: ${settings.limits.chapterLength}, your chapter: ${chapter.text.length}`
    );
  }

  const docRef = db.collection("chapters").doc(chapter.chapterid);
  try {
    /* const doc = await docRef.get();
    if (doc.exists) {
      const data = doc.data();
      if (data.created_at && data.created_at > chapter.created_at) {
        return failure(
          `Could not save, your copy of this chapter is older than the one in the database. Db: ${data.created_at}, your copy: ${chapter.created_at}. Please refresh to get the latest updates, then try again.`
        );
      }
    } */
    chapter.created_at = Date.now();

    await docRef.set(chapter);
    console.log("Successfully synced chapter to Firestore");
  } catch (error) {
    console.error("Error syncing chapter to Firestore:", error);
    return failure("Error saving chapter");
  }
  return success({ created_at: chapter.created_at });
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
    return success();
  }
  const { history } = bookObj.data();

  if (
    settings.limits.historyLength > 0 &&
    history.length >= settings.limits.historyLength
  ) {
    return failure(
      `History limit reached: ${settings.limits.historyLength}, ${chapterid}`
    );
  }

  let old = history[0];
  history.slice(1).forEach((patch) => {
    old = Diff.applyPatch(old, patch);
  });

  // const old = history[history.length - 1];
  console.log("old", old);
  if (old.trim() === text.trim()) {
    console.log("no change");
    return success();
  }
  const patch = Diff.createPatch(chapterid, old, text, "-", "-");
  history.push(patch);
  docRef = db.collection("history").doc(chapterid);
  await docRef.set({ history });
  return success();
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

export function markdownBlock(text) {
  return { type: "markdown", open: true, id: nanoid(), text, reference: false };
}

export function makeNewChapter(text, title, bookid, data = {}) {
  const texts = text.split("---").map((t) => markdownBlock(t.trim()));

  const chapterid = nanoid();
  const chapter = {
    chapterid,
    title,
    bookid,
    text: texts,
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
