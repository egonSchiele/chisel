import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import settings from "./settings.js";
import {
  saveBook,
  getBook,
  deleteBook,
  getBooks,
  saveChapter,
  deleteChapter,
  getChapter,
  saveToHistory,
  getHistory,
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

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

app.use(express.static("dist"));
app.use(cookieParser());

export const noCache = (req, res, next) => {
  // res.setHeader("Surrogate-Control", "no-store");
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
};

app.use(noCache);

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

app.post("/api/saveBook", requireLogin, async (req, res) => {
  let { book } = req.body;

  await saveBook(book);
  res.status(200).end();
});

app.post("/api/saveChapter", requireLogin, async (req, res) => {
  let { chapter } = req.body;
  console.log(chapter);
  await saveChapter(chapter);
  res.status(200).end();
});

app.post("/api/newBook", requireLogin, async (req, res) => {
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
      design: {
        coverColor: "bg-dmlistitem2",
        labelColor: "bg-blue-700",
        labelLinesColor: "border-yellow-400",
      },
      columnHeadings: [],
      favorite: false,
    };
    await saveBook(book);
    res.redirect(`/book/${bookid}`);
  }
});

app.post("/api/newChapter", requireLogin, async (req, res) => {
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
        favorite: false,
      };

      console.log(chapter);

      //book.chapters.push(chapter);
      await saveChapter(chapter);
      res.redirect(`/chapter/${chapterid}`);
    }
  }
});

app.post("/api/saveToHistory", requireLogin, async (req, res) => {
  let { chapterid, text } = req.body;

  console.log("saving to history");
  console.log(chapterid, text);

  await saveToHistory(chapterid, text);
  res.status(200).end();
});

app.get(
  "/api/getHistory/:chapterid",
  requireLogin,
  noCache,
  async (req, res) => {
    const { chapterid } = req.params;
    const history = await getHistory(chapterid);
    if (!history) {
      console.log("no history with id, " + chapterid);
      res.status(404).end();
    } else {
      res.json(history);
    }
  }
);

app.get("/chapter/:chapterid", requireLogin, noCache, async (req, res) => {
  const { chapterid } = req.params;
  const chapter = await getChapter(chapterid);
  if (!chapter) {
    console.log("no chapter with id, " + chapterid);
    res.redirect("/404");
  } else {
    res.sendFile(path.resolve("./dist/chapter.html"));
  }
});

app.get(
  "/book/:bookid/chapter/:chapterid",
  requireLogin,
  noCache,
  async (req, res) => {
    const { bookid, chapterid } = req.params;
    const chapter = await getChapter(chapterid);

    const book = await getBook(bookid);

    if (!chapter) {
      console.log("no chapter with id, " + chapterid);
      res.redirect("/404");
    } else if (!book) {
      console.log("no book with id, " + bookid);
      res.redirect("/404");
    } else {
      res.sendFile(path.resolve("./dist/chapter.html"));
    }
  }
);

app.get("/", requireLogin, async (req, res) => {
  res.sendFile(path.resolve("./dist/library.html"));
});

app.get("/404", async (req, res) => {
  res.sendFile(path.resolve("./dist/404.html"));
});

app.get("/api/settings", requireLogin, noCache, async (req, res) => {
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

app.post("/api/settings", requireLogin, async (req, res) => {
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

app.get("/books", requireLogin, noCache, async (req, res) => {
  const userid = getUserId(req);
  if (!userid) {
    console.log("no userid");
    res.status(404).end();
  } else {
    const books = await getBooks(userid);
    res.status(200).json({ books });
  }
});

app.get("/book/:bookid", requireLogin, noCache, async (req, res) => {
  res.sendFile(path.resolve("./dist/book.html"));
});

app.post("/api/deleteBook", requireLogin, async (req, res) => {
  const { bookid } = req.body;
  await deleteBook(bookid);
  res.redirect("/");
});

app.get("/api/book/:bookid", requireLogin, noCache, async (req, res) => {
  let { bookid } = req.params;
  try {
    const data = await getBook(bookid);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error getting book:", error);
    res.status(400).json({ error: error });
  }
});

app.get("/api/chapter/:chapterid", requireLogin, noCache, async (req, res) => {
  let { chapterid } = req.params;
  try {
    const data = await getChapter(chapterid);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error getting chapter:", error);
    res.status(400).json({ error: error });
  }
});

app.post("/api/deleteChapter", requireLogin, async (req, res) => {
  let { chapterid } = req.body;
  try {
    const data = await deleteChapter(chapterid);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error deleting chapter:", error);
    res.status(400).json({ error: error });
  }
});

app.post("/api/suggestions", requireLogin, async (req, res) => {
  console.log({ body: req.body });
  const user = await getUser(req);
  if (!user.permissions.openai_api) {
    res.status(400).json({ error: "no openai api permissions" });
    return;
  }
  let month_total = 0;
  month_total += user.usage.openai_api.tokens.month.prompt;
  month_total += user.usage.openai_api.tokens.month.completion;

  if (month_total > settings.maxMonthlyTokens) {
    res.status(400).json({ error: "month token limit reached" });
    return;
  }
  const chatModels = ["gpt-3.5-turbo"];
  let endpoint = "https://api.openai.com/v1/completions";
  let reqBody = {
    prompt: req.body.prompt,
    max_tokens: req.body.max_tokens,
    model: req.body.model,
    n: req.body.num_suggestions,
  };
  if (chatModels.includes(req.body.model)) {
    endpoint = "https://api.openai.com/v1/chat/completions";

    reqBody = {
      messages: [{ role: "user", content: req.body.prompt }],
      max_tokens: req.body.max_tokens,
      model: req.body.model,
      n: req.body.num_suggestions,
    };
    //"messages": [{"role": "user", "content": "Hello!"}]
  }

  //console.log({ prompt: JSON.parse(req.body) });
  fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.openAiApiKey}`,
    },
    body: JSON.stringify(reqBody),
  })
    .then((result) => {
      console.log({ result });
      result.json().then(async (json) => {
        console.log({ json });

        if (json.error) {
          res.status(400).json({ error: json.error.message });
          return;
        }
        user.usage.openai_api.tokens.month.prompt += json.usage.prompt_tokens;
        user.usage.openai_api.tokens.month.completion +=
          json.usage.completion_tokens;

        user.usage.openai_api.tokens.total.prompt += json.usage.prompt_tokens;
        user.usage.openai_api.tokens.total.completion +=
          json.usage.completion_tokens;

        await saveUser(user);
        /* {
  json: {
    id: 'chatcmpl-6yYGIiBy74VzsfSeC7smESchLVt0X',
    object: 'chat.completion',
    created: 1679889402,
    model: 'gpt-3.5-turbo-0301',
    usage: { prompt_tokens: 137, completion_tokens: 33, total_tokens: 170 },
    choices: [ [Object], [Object], [Object] ]
  }
} */
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
