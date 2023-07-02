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

export const saveBook = async (book, lastHeardFromServer) => {
  if (!book) {
    console.log("no book to save");
    return failure("No book to save");
  }

  const docRef = db.collection("books").doc(book.bookid);
  try {
    const doc = await docRef.get();
    if (doc.exists) {
      const data = doc.data();
      if (data.created_at && data.created_at > lastHeardFromServer) {
        return failure(
          `Could not save, your copy of this book is older than the one in the database. Db: ${new Date(
            data.created_at
          ).toLocaleString()}, your copy: ${new Date(
            lastHeardFromServer
          ).toLocaleString()}. Please refresh to get the latest updates, then try again.`
        );
      }
    }
    book.created_at = Date.now();

    if (book.chapterOrder) {
      book.chapterOrder = _.uniq(book.chapterOrder);
    }

    await docRef.set(book);
  } catch (error) {
    console.error("Error syncing book to Firestore:", error);
    return failure("Error saving book");
  }
  return success({});
};

export const getBook = async (bookid) => {
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
  const bookRef = db.collection("books").doc(bookid);
  const bookObj = await bookRef.get();
  const book = bookObj.data();
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
    const chapterData = chapter.data();
    allChapters.push(chapterData);
  });
  return allChapters;
};

export const deleteBook = async (bookid) => {
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
  return success({});
};

function asArray(snapshot) {
  const array = [];
  snapshot.forEach((doc) => {
    array.push(doc.data());
  });
  return array;
}

export const getBookTitles = async (userid) => {
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
    const oldLength = book.chapterOrder.length;
    book.chapterOrder = _.uniq(book.chapterOrder);
    if (oldLength !== book.chapterOrder.length) {
      console.log("duplicate chapters found for book", book.bookid, book.title);
    }
    allBooks.push(book);
  });
  await Promise.all(promises);

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
    await saveChapter(compostChapter, null);
    await saveBook(compostBook, null);

    compostBook.chapters = [compostChapter];
    compostBook.chapterOrder = [compostChapter.chapterid];

    allBooks.push(compostBook);
  }
  return allBooks;
};

export const saveEmbeddings = async (chapterid, data) => {
  const docRef = db.collection("embeddings").doc(chapterid);
  try {
    await docRef.set(data);
  } catch (error) {
    console.error("Error syncing embeddings to Firestore:", error);
    return failure("Error saving embeddings");
  }
  return success({ created_at: data.created_at });
};

export const getEmbeddingsForChapter = async (chapterid) => {
  const docRef = db.collection("embeddings").doc(chapterid);
  try {
    const embeddings = await docRef.get();
    if (embeddings.exists) {
      return embeddings.data();
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const saveChapter = async (chapter, lastHeardFromServer) => {
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
    const doc = await docRef.get();
    if (doc.exists) {
      const data = doc.data();
      if (data.created_at && data.created_at > lastHeardFromServer) {
        return failure(
          `Could not save, your copy of this chapter is older than the one in the database. Db: ${new Date(
            data.created_at
          ).toLocaleString()}, your copy: ${new Date(
            lastHeardFromServer
          ).toLocaleString()}. Please refresh to get the latest updates, then try again.`
        );
      }
    }

    chapter.created_at = Date.now();

    await docRef.set(chapter);
  } catch (error) {
    console.error("Error syncing chapter to Firestore:", error);
    return failure("Error saving chapter");
  }
  return success({});
};

export const getChapter = async (chapterid) => {
  const docRef = db.collection("chapters").doc(chapterid);
  const chapter = await docRef.get();
  if (!chapter.exists) {
    return null;
  }
  const data = chapter.data();
  if (data.embeddings) {
    delete data.embeddings;
    data.embeddingsLastCalculatedAt = null;
  }
  return data;
};

// TODO lastHeardFromServer for delete actions?
export const deleteChapter = async (chapterid, bookid) => {
  await db.collection("chapters").doc(chapterid).delete();
  const book = await getBook(bookid);
  if (!book) {
    console.log("no book to update");
    return failure("no book to update");
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
  return await saveBook(book, null);
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

export const saveSpeech = async (chapterid, data) => {
  const docRef = db.collection("speech").doc(chapterid);
  try {
    await docRef.set(data);
  } catch (error) {
    console.error("Error syncing embeddings to Firestore:", error);
    return failure("Error saving embeddings");
  }
  return success({ created_at: data.created_at });
};

export const getSpeech = async (chapterid) => {
  const docRef = db.collection("speech").doc(chapterid);
  try {
    const speech = await docRef.get();
    if (speech.exists) {
      return speech.data();
    }
    return null;
  } catch (error) {
    return null;
  }
};
