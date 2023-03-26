import { getFirestore } from "firebase-admin/firestore";

import admin from "firebase-admin";
import settings from "../../settings.js";
import serviceAccountKey from "../../serviceAccountKey.json" assert { type: "json" };
//const serviceAccountKey = await import(settings.firebaseServiceAccountKeyPath);
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey),
  });
} catch (e) {
  console.log(e);
}
const db = getFirestore();

export const saveBook = async (book) => {
  console.log("saving book");
  console.log({ book });
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
  const docRef = db.collection("books").doc(bookid);
  const bookObj = await docRef.get();
  if (!bookObj.exists) {
    return null;
  }
  const book = bookObj.data();
  const chapters = await db
    .collection("chapters")
    .where("bookid", "==", bookid)
    .get();
  console.log(chapters);
  if (chapters.empty) {
    console.log("No chapters found.");
  } else {
    chapters.forEach((chapter) => {
      book.chapters.push(chapter.data());
    });
  }
  return book;
};

export const getBooks = async (userid) => {
  console.log("getting books");
  console.log({ userid });
  const books = await db
    .collection("books")
    .where("userid", "==", userid)
    .get();
  console.log(books);
  if (books.empty) {
    console.log("No books found.");
    return [];
  } else {
    const allBooks = [];
    books.forEach((book) => {
      allBooks.push(book.data());
    });
    return allBooks;
  }
};

export const saveChapter = async (chapter) => {
  console.log("saving chapter");
  console.log({ chapter });
  if (!chapter) {
    console.log("no chapter to save");
    return;
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
