import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getFirestore } from "firebase-admin/firestore";
import admin from "firebase-admin";
import * as serviceAccountKey from "./serviceAccountKey.json" assert { type: "json" };

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("dist"));

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey.default),
  }); //export const analytics = getAnalytics(firebase);
} catch (e) {
  console.log(e);
}
// Get a reference to the database
const db = getFirestore();
app.post("/api/save", async (req, res) => {
  let { book } = req.body;
  book = JSON.parse(book);
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
  res.status(200).end();
});

app.get("/api/book/:bookid", async (req, res) => {
  let { bookid } = req.params;
  console.log("getting book");
  console.log({ bookid });
  const docRef = db.collection("books").doc(bookid);
  try {
    const book = await docRef.get();
    res.json(book.data());
  } catch (error) {
    console.error("Error syncing book to Firestore:", error);
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/expand", async (req, res) => {
  console.log({ body: req.body });

  const chatModels = ["gpt-3.5-turbo"];
  let endpoint = "https://api.openai.com/v1/completions";
  let reqBody = {
    prompt: req.body.prompt,
    max_tokens: req.body.max_tokens,
    model: req.body.model,
  };
  if (chatModels.includes(req.body.model)) {
    endpoint = "https://api.openai.com/v1/chat/completions";

    reqBody = {
      messages: [{ role: "user", content: req.body.prompt }],
      max_tokens: req.body.max_tokens,
      model: req.body.model,
    };
    //"messages": [{"role": "user", "content": "Hello!"}]
  }

  //console.log({ prompt: JSON.parse(req.body) });
  fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify(reqBody),
  })
    .then((result) => {
      console.log({ result });
      result.json().then((json) => {
        console.log({ json });
        let choices;
        if (chatModels.includes(req.body.model)) {
          choices = json.choices.map((choice) => ({
            text: choice.message.content,
          }));
        } else {
          choices = json.choices.map((choice) => ({ text: choice.text }));
        }
        res.json({ choices });
      });
    })
    .catch((error) => {
      console.log({ error });
      res.status(400).json({ error: error.message });
    });
});

const port = process.env.PORT || 80;
app.listen(port, () => console.log(`Server running on port ${port}`));
