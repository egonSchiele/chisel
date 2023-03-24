const firestore = require("firebase-admin/firestore");
const admin = require("firebase-admin");
const settings = require("../../settings.ts");
const serviceAccountKey = require("../../serviceAccountKey.json");
//const serviceAccountKey = await import(settings.firebaseServiceAccountKeyPath);
//console.log(serviceAccountKey, "<<");
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey),
  });
} catch (e) {
  console.log(e);
}
const db = firestore.getFirestore();

const saveBook = async (book) => {
  console.log("saving book");
  console.log({ book });
  book.created_at = Date.now();
  const docRef = db.collection("books").doc(book.bookid);
  try {
    await docRef.set(book);
    console.log("Successfully synced book to Firestore");
  } catch (error) {
    console.error("Error syncing book to Firestore:", error);
  }
};

const getBook = async (bookid) => {
  console.log("getting book");
  console.log({ bookid });
  const docRef = db.collection("books").doc(bookid);
  const book = await docRef.get();
  return book.data();
};

module.exports = {
  saveBook,
  getBook,
};
