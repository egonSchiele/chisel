import rateLimit from "express-rate-limit";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import * as fs from "fs";
import path from "path";
import cookieParser from "cookie-parser";

import { nanoid } from "nanoid";
import handlebars from "handlebars";
import {
  requireLogin,
  requireAdmin,
  submitLogin,
  submitRegister,
  getUserId,
  getUser,
  getUsers,
  saveUser,
  getBooksForUser,
  loginGuestUser,
} from "./src/authentication/firebase.js";
import {
  saveBook,
  getBook,
  deleteBook,
  getBooks,
  saveChapter,
  deleteChapter,
  favoriteChapter,
  favoriteBook,
  getChapter,
  saveToHistory,
  getHistory,
  makeNewBook,
  makeNewChapter,
  deleteBooks,
} from "./src/storage/firebase.js";
import settings from "./settings.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

app.use(express.static("public"));
app.use(express.static("dist"));

app.use(cookieParser());
app.disable("x-powered-by");
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply the rate limiting middleware to API calls only
app.use("/api", apiLimiter);
app.use("/loginGuestUser", apiLimiter);

const noCache = (req, res, next) => {
  // res.setHeader("Surrogate-Control", "no-store");
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
};

const csrf = (req, res, next) => {
  if (req.method !== "GET") {
    const excluded = ["/submitLogin", "/submitRegister"];
    if (excluded.includes(req.url)) {
      next();
      return;
    }
    const c = req.cookies;
    if (c.csrfToken === req.body.csrfToken) {
      next();
    } else {
      console.log(
        "csrf failed",
        req.url,
        req.method,
        c.csrfToken,
        req.body.csrfToken
      );
      res.send("csrf failed").end();
    }
  } else {
    next();
  }
};

app.use(csrf);

// eslint-disable-next-line consistent-return
const checkBookAccess = async (req, res, next) => {
  const c = req.cookies;

  console.log("checkBookAccess", req.params);
  let bookid;
  if (req.body) {
    bookid = req.body.bookid;
  }
  bookid = bookid || req.params.bookid;

  if (!bookid) {
    console.log("no bookid");
    return res.redirect("/404");
  }

  const book = await getBook(bookid);

  if (!book) {
    console.log(`no book with id, ${bookid}`);
    res.redirect("/404");
  } else if (book.userid !== c.userid) {
    console.log("no access to book");
    res.redirect("/404");
  } else {
    res.locals.book = book;
    next();
  }
};

const checkChapterAccess = async (req, res, next) => {
  const c = req.cookies;

  let bookid;
  let chapterid;
  if (req.body) {
    bookid = req.body.bookid;
    chapterid = req.body.chapterid;
  }
  bookid = bookid || req.params.bookid;
  chapterid = chapterid || req.params.chapterid;

  if (!bookid || !chapterid) {
    console.log("no bookid or chapterid");
    res.redirect("/404");
  }
  const chapter = await getChapter(chapterid);

  if (!chapter) {
    console.log(`no chapter with id, ${chapterid}`);
    res.redirect("/404");
  } else if (chapter.bookid !== bookid) {
    console.log("chapter is not part of book", chapterid, bookid);
    res.redirect("/404");
  } else {
    res.locals.chapter = chapter;
    next();
  }
};

app.use(noCache);

app.post("/submitLogin", async (req, res) => {
  await submitLogin(req, res);
});

app.post("/submitRegister", async (req, res) => {
  await submitRegister(req, res);
});

app.post("/loginGuestUser", async (req, res) => {
  await loginGuestUser(req, res);
});

app.get("/logout", async (req, res) => {
  res.clearCookie("userid");
  res.clearCookie("token");
  res.redirect("/login.html");
});

app.post("/api/saveBook", requireLogin, async (req, res) => {
  const { book } = req.body;

  await saveBook(book);
  res.status(200).end();
});

app.post("/api/saveChapter", requireLogin, async (req, res) => {
  const { chapter } = req.body;
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
    const book = makeNewBook({
      userid,
    });
    await saveBook(book);
    res.send(book);
    // res.redirect(`/book/${bookid}`);
  }
});

app.post("/api/newChapter", requireLogin, checkBookAccess, async (req, res) => {
  const userid = getUserId(req);
  console.log(req.body);
  const { bookid, title, text } = req.body;

  const chapter = makeNewChapter(text, title, bookid);

  await saveChapter(chapter);

  res.send(chapter);
  // res.status(200).end();
});

app.post("/api/saveToHistory", requireLogin, async (req, res) => {
  const { chapterid, text } = req.body;
  console.log("saveToHistory", chapterid, text);
  await saveToHistory(chapterid, text);
  res.status(200).end();
});

app.get(
  "/api/getHistory/:bookid/:chapterid",
  requireLogin,
  checkBookAccess,
  checkChapterAccess,
  async (req, res) => {
    const { chapterid } = req.params;
    const history = await getHistory(chapterid);
    if (!history) {
      console.log(`no history with id, ${chapterid}`);
      res.status(404).end();
    } else {
      res.json(history);
    }
  }
);

const fileCache = {};
const render = (filename, _data) => {
  let template;
  const data = { ..._data };
  if (!fileCache[filename]) {
    const source = fs.readFileSync(filename, { encoding: "utf8", flag: "r" });
    template = handlebars.compile(source);
    fileCache[filename] = template;
  } else {
    template = fileCache[filename];
  }
  const result = template(data);
  return result;
};

function serveFile(filename, res) {
  const token = nanoid();
  res.cookie("csrfToken", token);

  const rendered = render(path.resolve(`./dist/${filename}`), {
    csrfToken: token,
  });
  res.send(rendered).end();
}

app.get(
  "/book/:bookid/chapter/:chapterid/:textindex",
  requireLogin,
  checkBookAccess,
  checkChapterAccess,
  async (req, res) => {
    serveFile("chapter.html", res);
  }
);
app.get(
  "/book/:bookid/chapter/:chapterid",
  requireLogin,
  checkBookAccess,
  checkChapterAccess,
  async (req, res) => {
    serveFile("chapter.html", res);
  }
);

app.get("/", requireLogin, async (req, res) => {
  serveFile("library.html", res);
});

app.get("/home.html", requireLogin, async (req, res) => {
  serveFile("library.html", res);
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
    res.status(200).json({ settings: user.settings, usage: user.usage });
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

app.get("/book/:bookid", requireLogin, checkBookAccess, async (req, res) => {
  serveFile("book.html", res);
});

app.get("/grid/:bookid", requireLogin, checkBookAccess, async (req, res) => {
  serveFile("book.html", res);
});

app.post("/api/deleteBook", requireLogin, checkBookAccess, async (req, res) => {
  const { bookid } = req.body;
  await deleteBook(bookid);
  res.status(200).end();
  // res.redirect("/");
});

app.get(
  "/api/book/:bookid",
  requireLogin,
  checkBookAccess,
  async (req, res) => {
    const { bookid } = req.params;
    try {
      let { book } = res.locals;
      // Should always be set by the `checkBookAccess` middleware
      if (!book) {
        book = await getBook(bookid);
      }
      res.status(200).json(book);
    } catch (error) {
      console.error("Error getting book:", error);
      res.status(400).json({ error });
    }
  }
);

app.get(
  "/api/chapter/:bookid/:chapterid",
  requireLogin,
  checkBookAccess,
  checkChapterAccess,
  async (req, res) => {
    const { chapterid } = req.params;
    try {
      let { chapter } = res.locals;
      // Not needed if checkChapterAccess occurs
      if (!chapter) {
        chapter = await getChapter(chapterid);
      }
      res.status(200).json(chapter);
    } catch (error) {
      console.error("Error getting chapter:", error);
      res.status(400).json({ error });
    }
  }
);

app.post(
  "/api/deleteChapter",
  requireLogin,
  checkBookAccess,
  checkChapterAccess,
  async (req, res) => {
    const { chapterid, bookid } = req.body;
    try {
      const data = await deleteChapter(chapterid, bookid);
      res.status(200).json(data);
    } catch (error) {
      console.error("Error deleting chapter:", error);
      res.status(400).json({ error });
    }
  }
);

app.post(
  "/api/favoriteChapter",
  requireLogin,
  checkBookAccess,
  checkChapterAccess,
  async (req, res) => {
    const { chapterid } = req.body;
    try {
      const data = await favoriteChapter(chapterid);
      res.status(200).json(data);
    } catch (error) {
      console.error("Error favoriting chapter:", error);
      res.status(400).json({ error });
    }
  }
);

app.post(
  "/api/favoriteBook",
  requireLogin,
  checkBookAccess,
  async (req, res) => {
    const { bookid } = req.body;
    try {
      const data = await favoriteBook(bookid);
      res.status(200).json(data);
    } catch (error) {
      console.error("Error favoriting book:", error);
      res.status(400).json({ error });
    }
  }
);

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
    res.status(400).json({ error: "Monthly token limit reached" });
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
    // "messages": [{"role": "user", "content": "Hello!"}]
  }

  // console.log({ prompt: JSON.parse(req.body) });
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

app.get("/admin", requireAdmin, async (req, res) => {
  serveFile("admin.html", res);
});
app.get("/api/admin/users", requireAdmin, async (req, res) => {
  const data = await getUsers();
  res.status(200).json(data);
});

app.get("/api/admin/deleteTestUserBooks", requireAdmin, async (req, res) => {
  await deleteBooks("ZMLuWv0J2HkI30kEfm5xs");
  res.status(200).end();
});

const port = process.env.PORT || 80;
app.listen(port, () => console.log(`Server running on port ${port}`));
