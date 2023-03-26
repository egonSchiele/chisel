import express from "express";
import cors from "cors";
import dotenv from "dotenv";
//import settings from "./settings.js";
import {
  saveBook,
  getBook,
  deleteBook,
  getBooks,
  saveChapter,
  getChapter,
} from "./src/storage/firebase.js";
//import fs from "fs"
import * as fs from "fs";
import path from "path";
import cookieParser from "cookie-parser";
//import * as t from "./src/Types";
import {
  requireLogin,
  submitLogin,
  submitRegister,
  getUserId,
  getUser,
  saveUser,
} from "./src/authentication/firebase.js";
import { nanoid } from "nanoid";
//const serviceAccountKey = require("./serviceAccountKey.json");

/* import { initializeApp } from "firebase/app";
import { getAuth } from "@firebase/auth"; */

// const credentials = await signInWithEmailAndPassword(auth, email, password);
// const firebaseUser = credentials.user;

//const firebaseCommon = require("@firebase
/* import { signInWithEmailAndPassword } from "@firebase/auth";

import { firebase, auth, _getAuth } from "@/common/firebase";
 */ // import settings from "./settings.ts";
// import { saveBook, getBook } from "./src/storage/firebase.ts";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

app.use(express.static("dist"));
app.use(cookieParser());

app.post("/submitLogin", async (req, res) => {
  await submitLogin(req, res);
});

app.post("/submitRegister", async (req, res) => {
  await submitRegister(req, res);
});

app.get("/logout", async (req, res) => {
  res.clearCookie("userid");
  res.clearCookie("token");
  res.redirect("/login.html");
});

app.post("/api/saveBook", async (req, res) => {
  let { book } = req.body;

  await saveBook(book);
  res.status(200).end();
});

app.post("/api/saveChapter", async (req, res) => {
  let { chapter } = req.body;
  console.log(chapter);
  await saveChapter(chapter);
  res.status(200).end();
});

app.post("/api/newBook", async (req, res) => {
  const userid = getUserId(req);
  if (!userid) {
    console.log("no userid");
    res.status(404).end();
  } else {
    const bookid = nanoid();
    const book = {
      userid: userid,
      bookid,
      title: "Untitled",
      author: "Unknown",
      chapters: [],
    };
    await saveBook(book);
    res.redirect(`/book/${bookid}`);
  }
});

app.post("/api/newChapter", async (req, res) => {
  const userid = getUserId(req);
  console.log(req.body);
  const { bookid } = req.body;
  if (!userid) {
    console.log("no userid");
    res.status(404).end();
  } else {
    const book = await getBook(bookid);
    if (!book) {
      console.log("no book with id, " + bookid);
      res.status(404).end();
    } else {
      const chapterid = nanoid();
      const chapter = {
        bookid,
        chapterid,
        title: "New Chapter",
        text: "Once upon a time...",
        pos: { x: 0, y: 0 },
        suggestions: [],
      };

      console.log(chapter);

      //book.chapters.push(chapter);
      await saveChapter(chapter);
      res.redirect(`/chapter/${chapterid}`);
    }
  }
});

app.get("/chapter/:chapterid", requireLogin, async (req, res) => {
  const { chapterid } = req.params;
  const chapter = await getChapter(chapterid);
  if (!chapter) {
    console.log("no chapter with id, " + chapterid);
    res.status(404).end();
  } else {
    res.sendFile(path.resolve("./dist/chapter.html"));
  }
});

app.get("/", requireLogin, async (req, res) => {
  res.sendFile(path.resolve("./dist/library.html"));
});

app.get("/api/settings", async (req, res) => {
  console.log("getting settings");

  const user = await getUser(req);
  if (!user) {
    console.log("no user");
    res.status(404).end();
  } else {
    console.log(user);
    res.status(200).json({ settings: user.settings });
  }
});

app.post("/api/settings", async (req, res) => {
  const { settings } = req.body;
  if (!settings) {
    console.log("no settings");
    res.status(404).end();
  } else {
    const user = await getUser(req);
    if (!user) {
      console.log("no user");
      res.status(404).end();
    } else {
      user.settings = settings;
      const result = await saveUser(user);
      if (!result) {
        console.log("error saving user");
        res.status(500).end();
      } else {
        res.status(200).json({ settings: user.settings });
      }
    }
  }
});

app.get("/books", requireLogin, async (req, res) => {
  const userid = getUserId(req);
  if (!userid) {
    console.log("no userid");
    res.status(404).end();
  } else {
    const books = await getBooks(userid);
    res.status(200).json({ books });
  }
});

app.get("/book/:bookid", requireLogin, async (req, res) => {
  res.sendFile(path.resolve("./dist/book.html"));
});

app.post("/api/deleteBook", requireLogin, async (req, res) => {
  const { bookid } = req.body;
  await deleteBook(bookid);
  res.redirect("/");
});

app.get("/api/book/:bookid", async (req, res) => {
  let { bookid } = req.params;
  try {
    const data = await getBook(bookid);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error getting book:", error);
    res.status(400).json({ error: error });
  }
});

app.get("/api/chapter/:chapterid", async (req, res) => {
  let { chapterid } = req.params;
  try {
    const data = await getChapter(chapterid);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error getting chapter:", error);
    res.status(400).json({ error: error });
  }
});

app.post("/api/suggestions", async (req, res) => {
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
