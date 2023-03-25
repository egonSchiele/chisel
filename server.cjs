const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const settings = require("./settings.ts");
const storage = require("./src/storage/firebase.ts");
const fs = require("fs");
const path = require("path");
const firebaseAuth = require("@firebase/auth");
const firebaseApp = require("firebase/app");
const cookieParser = require("cookie-parser");
//const serviceAccountKey = require("./serviceAccountKey.json");

/* import { initializeApp } from "firebase/app";
import { getAuth } from "@firebase/auth"; */
const firebase = firebaseApp.initializeApp(settings.firebaseConfig);
const auth = firebaseAuth.getAuth(firebase);

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

async function stringToHash(str) {
  const encoder = new TextEncoder();
  const salt = process.env.SALT;
  const data = encoder.encode(str + salt);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const requireLogin = (req, res, next) => {
  const c = req.cookies;
  //console.log({ req });
  console.log(req.cookies);
  if (!req.cookies.userid) {
    console.log("no userid");
    res.redirect("/login.html");
  } else {
    stringToHash(req.cookies.userid).then((hash) => {
      console.log({ hash, token: req.cookies.token });
      if (hash !== req.cookies.token) {
        res.redirect("/login.html");
      } else {
        next();
      }
    });
  }
};

app.post("/submitLogin", async (req, res) => {
  console.log(req);
  console.log(req.body);
  const { email, password } = req.body;
  console.log({ email, password });

  const credentials = await firebaseAuth.signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  const firebaseUser = credentials.user;
  console.log(firebaseUser);
  res.cookie("userid", firebaseUser.uid);

  const token = await stringToHash(firebaseUser.uid);
  res.cookie("token", token);
  res.redirect("/");
});

app.get("/logout", async (req, res) => {
  res.clearCookie("userid");
  res.clearCookie("token");
  res.redirect("/login.html");
});

app.post("/api/save", async (req, res) => {
  let { book } = req.body;
  book = JSON.parse(book);
  await storage.saveBook(book);
  res.status(200).end();
});

app.get("/chapter/:chapterid", requireLogin, async (req, res) => {
  fs.readFile(path.resolve("./dist/index.html"), "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("An error occurred");
    }

    return res.send(data);
  });
});

app.get("/", requireLogin, async (req, res) => {
  fs.readFile(path.resolve("./dist/index.html"), "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("An error occurred");
    }

    return res.send(data);
  });
});

app.get("/api/book/:bookid", async (req, res) => {
  let { bookid } = req.params;
  try {
    const data = await storage.getBook(bookid);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error getting book:", error);
    res.status(400).json({ error: error });
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
