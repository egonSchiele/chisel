import { HfInference } from "@huggingface/inference";

import blocklist from "./src/blocklist.js";
import wordnet from "wordnet";
import zip from "lodash";
import similarity from "compute-cosine-similarity";
import rateLimit from "express-rate-limit";
import express from "express";
import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import browser from "browser-detect";
import * as fs from "fs";
import path from "path";
import cookieParser from "cookie-parser";
import AdmZip from "adm-zip";
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
  resetMonthlyTokenCounts,
} from "./src/authentication/firebase.js";
import {
  saveBook,
  getBook,
  deleteBook,
  getBooks,
  getBookTitles,
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
  success,
  failure,
  getChaptersForBook,
  getBookToCheckAccess,
} from "./src/storage/firebase.js";
import settings from "./settings.js";
import { chapterToMarkdown, toMarkdown } from "./src/serverUtils.js";
import Replicate from "replicate";

const replicate = new Replicate({
  // get your token from https://replicate.com/account
  auth: settings.replicateApiKey,
});

console.log("Initializing wordnet");
await wordnet.init("wordnet");
//const list = await wordnet.list();

//console.log(JSON.stringify(definitions, null, 2));

dotenv.config();

const app = express();
app.use(cors());
app.use(
  express.raw({ type: ["multipart/form-data", "application/octet-stream"] })
);
app.use(express.json({ limit: "5mb" }));
app.use(
  express.urlencoded({
    limit: "5mb",
    extended: true,
  })
);
app.use(compression());

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

function isMobile(req) {
  return browser(req.headers["user-agent"]).mobile;
}

const csrf = (req, res, next) => {
  if (req.method !== "GET") {
    const excluded = ["/submitLogin", "/submitRegister", "/loginGuestUser"];
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
      res
        .status(400)
        .send("Could not butter your parsnips. Try refreshing your browser.")
        .end();
    }
  } else {
    next();
  }
};

app.use(csrf);

const bookAccessCache = {};
const chapterAccessCache = {};

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

  const { userid } = c;
  if (!userid) {
    console.log("no userid");
    return res.redirect("/404");
  }

  const key = `${userid}-${bookid}`;
  if (bookAccessCache[key]) {
    console.log("bookAccessCache hit");
    next();
    return;
  }

  const book = await getBookToCheckAccess(bookid);

  if (!book) {
    console.log(`no book with id, ${bookid}`);
    res.redirect("/404");
  } else if (book.userid !== c.userid) {
    console.log("no access to book");
    res.redirect("/404");
  } else {
    bookAccessCache[key] = true;
    res.locals.bookid = bookid;
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
  const { userid } = c;
  const key = `${userid}-${bookid}-${chapterid}`;
  if (chapterAccessCache[key]) {
    console.log("chapterAccessCache hit");
    next();
    return;
  }

  const chapter = await getChapter(chapterid);

  if (!chapter) {
    console.log(`no chapter with id, ${chapterid}`);
    res.redirect("/404");
  } else if (chapter.bookid !== bookid) {
    console.log("chapter is not part of book", chapterid, bookid);
    res.redirect("/404");
  } else {
    chapterAccessCache[key] = true;
    res.locals.chapterid = chapterid;
    next();
  }
};

//app.use(noCache);

const lastEditedCache = {};

function updateLastEdited(req) {
  const date = Date.now();
  const userid = getUserId(req);
  lastEditedCache[userid] = date;
  return date;
}

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
  res.redirect("/login");
});

app.post("/api/saveBook", requireLogin, async (req, res) => {
  const { book } = req.body;

  const result = await saveBook(book);
  if (result.success) {
    data.created_at = updateLastEdited(req);
    res.status(200).json(result.data);
  } else {
    res.status(400).send(result.message).end();
  }
});

app.post("/api/saveChapter", requireLogin, async (req, res) => {
  const { chapter } = req.body;
  const result = await saveChapter(chapter);
  if (result.success) {
    data.created_at = updateLastEdited(req);
    res.status(200).json(result.data);
  } else {
    res.status(400).send(result.message).end();
  }
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
    const created_at = updateLastEdited(req);
    res.send(book);
    // res.redirect(`/book/${bookid}`);
  }
});

app.post("/api/uploadAudio", requireAdmin, async (req, res) => {
  const user = await getUser(req);
  const userid = user.userid;
  const { audio } = req.body;
  fs.writeFile("test.mp3", req.body, function (err) {
    if (err) {
      console.log(err);
    }
  });
  res.send("ok");
});

app.post("/api/uploadBook", requireLogin, async (req, res) => {
  const user = await getUser(req);
  const userid = user.userid;
  const chapters = req.body.chapters;

  const book = makeNewBook({
    userid,
  });
  const promises = chapters.map(async (chapter) => {
    const newChapter = makeNewChapter(chapter.text, chapter.title, book.bookid);
    await saveChapter(newChapter);
    book.chapters.push(newChapter);
  });
  await Promise.all(promises);
  const promptText = chapters
    .map((chapter) => chapter.text)
    .join("\n\n")
    .substring(0, 10000);

  const prompt = `Given this text, give me a synopsis of the book as well as its major characters. For the characters, return a name, description, and image URL of what you think this character looks like. Also include links to any other books you think are related. Here's the text: ${promptText}`;

  const schema =
    " {title:string, author:string, synopsis: string, characters: [{name: string, description: string, imageUrl:string}], links:string[]}";
  const max_tokens = 1500;
  const num_suggestions = 1;
  const model = "gpt-3.5-turbo";

  const suggestions = await getSuggestionsJSON(
    user,
    prompt,
    max_tokens,
    model,
    num_suggestions,
    schema
  );

  if (suggestions.success) {
    try {
      const { title, author, synopsis, characters, links } = suggestions.data;
      book.synopsis = synopsis + "\n\n" + links.join("\n");
      book.characters = characters;
      book.title = title;
      book.author = author;
    } catch (e) {
      console.log(e);
      book.synopsis = JSON.stringify(suggestions.data);
    }
  } else {
    book.synopsis = suggestions.message;
  }
  await saveBook(book);
  res.send(book);
});

app.post("/api/newChapter", requireLogin, checkBookAccess, async (req, res) => {
  const userid = getUserId(req);

  const { bookid, title, text } = req.body;

  const chapter = makeNewChapter(text, title, bookid);

  await saveChapter(chapter);
  const created_at = updateLastEdited(req);

  res.send(chapter);
  // res.status(200).end();
});

app.post("/api/saveToHistory", requireLogin, async (req, res) => {
  const { chapterid, text } = req.body;
  console.log("saveToHistory", chapterid, text);

  const result = await saveToHistory(chapterid, text);
  res.status(200).end();

  if (result.success) {
    res.status(200).end();
  } else {
    res.status(400).send(result.message).end();
  }
});

function mk(prompt, schema = null) {
  return { prompt, schema };
}

app.get(
  "/api/chain2",
  requireAdmin,

  async (req, res) => {
    const suggestions = await chain(req, "", []);
    console.log(JSON.stringify(suggestions));

    res.json(suggestions);
  }
);

async function chain(req, promptText, steps) {
  const max_tokens = 500;
  const num_suggestions = 1;
  const model = "gpt-3.5-turbo";
  const user = await getUser(req);
  let result = [];
  for (const step of steps) {
    let prompt = step.prompt;
    if (typeof prompt === "function") {
      try {
        prompt = prompt(result.at(-1));
      } catch (e) {
        console.log(e);
        return {
          success: false,
          message: `Couldn't apply prompt in chain: ${e.message}`,
        };
      }
    }
    if (prompt === null) continue;
    prompt = prompt.replace("{{text}}", promptText);
    console.log({ prompt });
    const schema = step.schema;
    let suggestions;
    if (schema) {
      suggestions = await getSuggestionsJSON(
        user,
        prompt,
        max_tokens,
        model,
        num_suggestions,
        schema
      );
    } else {
      suggestions = await getSuggestions(
        user,
        prompt,
        max_tokens,
        model,
        num_suggestions,
        null,
        null
      );
    }
    console.log("suggestions: " + JSON.stringify(suggestions));
    if (!suggestions.success) {
      console.log(suggestions.message);
      return suggestions;
    } else {
      if (schema) {
        result.push(suggestions.data);
      } else {
        result.push(suggestions.data.choices[0].text);
      }
    }
  }
  return result;
}

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

app.get("/login", async (req, res) => {
  serveFile("login-base.html", res);
});

app.get("/register", async (req, res) => {
  serveFile("login-base.html", res);
});

app.get("/login.html", async (req, res) => {
  serveFile("login-base.html", res);
});

app.get("/register.html", async (req, res) => {
  serveFile("login-base.html", res);
});

app.get(
  "/book/:bookid/chapter/:chapterid/:textindex",
  requireLogin,
  checkBookAccess,
  checkChapterAccess,
  async (req, res) => {
    if (isMobile(req)) {
      serveFile("mobile.html", res);
    } else {
      serveFile("library.html", res);
    }
  }
);
app.get(
  "/book/:bookid/chapter/:chapterid",
  requireLogin,
  checkBookAccess,
  checkChapterAccess,
  async (req, res) => {
    if (isMobile(req)) {
      serveFile("mobile.html", res);
    } else {
      serveFile("library.html", res);
    }
  }
);

app.get("/", requireLogin, async (req, res) => {
  if (isMobile(req)) {
    serveFile("mobile.html", res);
  } else {
    serveFile("library.html", res);
  }
});

app.get("/home.html", requireLogin, async (req, res) => {
  if (isMobile(req)) {
    serveFile("mobile.html", res);
  } else {
    serveFile("library.html", res);
  }
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
    const settings = user.settings;
    settings.admin = user.admin;
    res.status(200).json({ settings, usage: user.usage });
  }
});

app.post("/api/settings", requireLogin, async (req, res) => {
  const { settings } = req.body;
  console.log("saving settings", settings);
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

app.get("/api/books", requireLogin, noCache, async (req, res) => {
  const userid = getUserId(req);
  if (!userid) {
    console.log("no userid");
    res.status(404).end();
  } else {
    const books = await getBooks(userid);

    const lastEdited = updateLastEdited(req);
    res.status(200).json({ books, lastEdited });
  }
});

app.get("/api/getLastEdited", requireLogin, noCache, async (req, res) => {
  const lastEdited = lastEditedCache[req.cookies.userid];
  console.log("lastEdited", lastEdited);
  res.status(200).json({ lastEdited });
});

app.get("/api/bookTitles", requireLogin, noCache, async (req, res) => {
  const userid = getUserId(req);
  if (!userid) {
    console.log("no userid");
    res.status(404).end();
  } else {
    const books = await getBookTitles(userid);

    res.status(200).json({ books });
  }
});

app.get("/book/:bookid", requireLogin, checkBookAccess, async (req, res) => {
  if (isMobile(req)) {
    serveFile("mobile.html", res);
  } else {
    serveFile("library.html", res);
  }
});

app.get("/grid/:bookid", requireLogin, checkBookAccess, async (req, res) => {
  serveFile("library.html", res);
});

app.post("/api/deleteBook", requireLogin, checkBookAccess, async (req, res) => {
  const { bookid } = req.body;
  await deleteBook(bookid);
  const created_at = updateLastEdited(req);
  res.status(200).json({ created_at });
  // res.redirect("/");
});

app.get(
  "/api/exportBook/:bookid/:title",
  requireLogin,
  checkBookAccess,
  async (req, res) => {
    try {
      const book = await getBook(res.locals.bookid);

      // creating archives
      const zip = new AdmZip();

      book.chapters.forEach((chapter) => {
        const content = chapterToMarkdown(chapter, false);
        let title = chapter.title || "untitled";
        title = title.replace(/[^a-z0-9_]/gi, "-").toLowerCase() + ".md";
        zip.addFile(title, Buffer.from(content, "utf8"), "");
      });
      const finalZip = zip.toBuffer();

      res.status(200).send(finalZip);
    } catch (error) {
      console.error("Error getting chapter:", error);
      res.status(400).json({ error });
    }
  }
);
app.get(
  "/api/exportChapter/:bookid/:chapterid/:title",
  requireLogin,
  checkBookAccess,
  checkChapterAccess,
  async (req, res) => {
    const { title } = req.params;
    try {
      const chapter = await getChapter(res.locals.chapterid);

      res.set("Content-Disposition", `attachment; filename="${title}"`);

      res.status(200).send(chapterToMarkdown(chapter, false));
    } catch (error) {
      console.error("Error getting chapter:", error);
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
    try {
      const chapter = await getChapter(res.locals.chapterid);

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
      await deleteChapter(chapterid, bookid);
      const created_at = updateLastEdited(req);
      res.status(200).json({ created_at });
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
      await favoriteChapter(chapterid);
      const created_at = updateLastEdited(req);
      res.status(200).json({ created_at });
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
      await favoriteBook(bookid);
      const created_at = updateLastEdited(req);
      res.status(200).json({ created_at });
    } catch (error) {
      console.error("Error favoriting book:", error);
      res.status(400).json({ error });
    }
  }
);

app.post("/api/suggestions", requireLogin, async (req, res) => {
  console.log({ body: req.body });
  const user = await getUser(req);
  const prompt = req.body.prompt.substring(0, settings.maxPromptLength);
  const suggestions = await getSuggestions(
    user,
    prompt,
    req.body.max_tokens,
    req.body.model,
    req.body.num_suggestions,
    req.body.messages || [],
    req.body.customKey
  );
  if (suggestions.success) {
    res.status(200).json(suggestions.data);
  } else {
    res.status(400).json({ error: suggestions.message });
  }
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

app.get(
  "/api/admin/resetMonthlyTokenCounts",
  requireAdmin,
  async (req, res) => {
    await resetMonthlyTokenCounts();
    res.status(200).end();
  }
);

app.get(
  "/api/getEmbeddings/:bookid/:chapterid",
  requireLogin,
  checkBookAccess,
  checkChapterAccess,
  async (req, res) => {
    const chapter = await getChapter(res.locals.chapterid);

    const user = await getUser(req);
    const embeddings = await getEmbeddings(
      user,
      chapterToMarkdown(chapter, false)
    );
    res.status(200).json({ embeddings });
  }
);

app.get(
  "/api/trainOnBook/:bookid",
  requireLogin,
  checkBookAccess,
  async (req, res) => {
    const book = await getBook(res.locals.bookid);
    const chapters = book.chapters;
    const user = await getUser(req);
    const timestamp = Date.now();
    let promises = chapters
      .filter((chapter) => {
        return (
          !chapter.embeddingsLastCalculatedAt ||
          chapter.created_at > chapter.embeddingsLastCalculatedAt
        );
      })
      .map(async (chapter) => {
        const blockPromises = chapter.text.map(async (block) => {
          const blockEmbeddings = await getEmbeddings(user, block.text);
          return blockEmbeddings;
        });
        const embeddings = await Promise.all(blockPromises);
        return { chapter, embeddings };
      });
    const allEmbeddings = await Promise.all(promises);
    promises = allEmbeddings.map(async ({ chapter, embeddings }) => {
      chapter.text.forEach((block, i) => {
        if (embeddings[i].success) {
          block.embeddings = embeddings[i].data;
        }
      });

      chapter.embeddingsLastCalculatedAt = timestamp;
      await saveChapter(chapter);
    });

    book.lastTrainedAt = timestamp;
    await Promise.all([...promises, saveBook(book)]);

    res.status(200).json({ lastTrainedAt: timestamp });
  }
);

app.get(
  "/api/define/:word",
  requireLogin,

  async (req, res) => {
    try {
      const definitions = await wordnet.lookup(req.params.word);
      definitions.forEach((definition) => {
        if (definition.meta && definition.meta.pointers) {
          delete definition.meta.pointers;
        }
      });
      res.status(200).json(definitions);
    } catch (error) {
      console.error("No definitions found for word:", req.params.word);
      res
        .status(400)
        .json({ error: `No definitions found for word: '${req.params.word}'` });
    }
  }
);

app.post(
  "/api/askQuestion/:bookid",
  requireLogin,
  checkBookAccess,
  async (req, res) => {
    const book = await getBook(res.locals.bookid);
    const chapters = await getChaptersForBook(book.bookid, true);
    const user = await getUser(req);
    const { question } = req.body;
    const questionEmbeddings = await getEmbeddings(user, question);
    // Use cosine similarity to find the most similar chapter.
    // We will use that as context for GPT when asking our question

    let max = 0;
    let mostSimilarBlock;
    chapters.forEach((chapter) => {
      chapter.text.forEach((block, i) => {
        if (block.embeddings && block.embeddings.length > 0) {
          const similarityScore = similarity(
            questionEmbeddings.data,
            block.embeddings
          );
          if (similarityScore > max) {
            max = similarityScore;
            mostSimilarBlock = { block, chapter, i };
          }
        }
      });
    });

    let prompt = `Context: ${mostSimilarBlock.block.text}`;

    prompt = prompt.substring(0, settings.maxPromptLength);
    prompt += `\n\nQuestion: ${question}\n\nAnswer:`;
    const suggestions = await getSuggestions(user, prompt);

    if (suggestions.success) {
      const answer = suggestions.data.choices[0].text;
      res.status(200).json({
        answer,
        chapterid: mostSimilarBlock.chapter.chapterid,
        blockIndex: mostSimilarBlock.i,
      });
    } else {
      res.status(400).json({ error: suggestions.error });
    }
  }
);

const port = process.env.PORT || 80;
app.listen(port, () => console.log(`Server running on port ${port}`));

async function getSuggestionsJSON(
  user,
  _prompt,
  max_tokens,
  model,
  num_suggestions,
  schema,
  retries = 3
) {
  const prompt = `Please respond ONLY with valid json that conforms to this schema: ${schema}. Do not include additional text other than the object json as we will parse this object with JSON.parse. If you do not respond with valid json, we will ask you to try again. Prompt: ${_prompt}`;

  const messages = [{ role: "user", content: prompt }];
  let tries = 0;
  let text;
  while (tries < retries) {
    const suggestions = await getSuggestions(
      user,
      "",
      max_tokens,
      model,
      num_suggestions,
      messages
    );
    if (suggestions.success) {
      text = suggestions.data.choices[0].text;
      try {
        const json = JSON.parse(text);
        return success(json);
      } catch (e) {
        console.log(e);
        tries += 1;
        messages.push({
          role: "system",
          content: `JSON.parse error: ${e.message}`,
        });
      }
    } else {
      return suggestions;
      //tries += 1;
    }
  }
  return failure(text);
}

function checkUsage(user) {
  if (!user.permissions.openai_api) {
    return failure("no openai api permissions");
  }
  let month_total = 0;
  month_total += user.usage.openai_api.tokens.month.prompt || 0;
  month_total += user.usage.openai_api.tokens.month.completion || 0;

  if (user.guest && month_total > settings.maxMonthlyGuestTokens) {
    return failure("monthly guest token limit reached");
  } else if (month_total > settings.maxMonthlyTokens) {
    return failure("monthly token limit reached");
  }
  return success();
}

async function updateUsage(user, usage) {
  user.usage.openai_api.tokens.month.prompt += usage.prompt_tokens || 0;
  user.usage.openai_api.tokens.month.completion += usage.completion_tokens || 0;

  user.usage.openai_api.tokens.total.prompt += usage.prompt_tokens || 0;
  user.usage.openai_api.tokens.total.completion += usage.completion_tokens || 0;

  await saveUser(user);
}

async function getSuggestions(
  user,
  _prompt,
  _max_tokens = 500,
  model = "gpt-3.5-turbo",
  _num_suggestions = 1,
  _messages = null,
  customKey
) {
  if (!customKey) {
    const check = checkUsage(user);
    if (!check.success) {
      return check;
    }
  }

  const prompt = _prompt.substring(0, settings.maxPromptLength);
  const max_tokens = Math.min(_max_tokens, settings.maxTokens);
  const num_suggestions = Math.min(_num_suggestions, settings.maxSuggestions);

  const openAiModels = ["gpt-3.5-turbo", "curie"];

  const replicateModels = [
    "vicuna-13b",
    "llama-7b",
    "stablelm-tuned-alpha-7b",
    "flan-t5-xl",
  ];

  const huggingfaceModels = ["TheBloke/guanaco-65B-HF", "gpt2"];

  let result;

  if (openAiModels.includes(model)) {
    result = await usingOpenAi(
      user,
      prompt,
      max_tokens,
      model,
      num_suggestions,
      _messages,
      customKey
    );
  } else if (replicateModels.includes(model) && user.admin) {
    result = await usingReplicate(
      user,
      prompt,
      max_tokens,
      model,
      num_suggestions,
      _messages,
      customKey
    );
  } else if (huggingfaceModels.includes(model)) {
    result = await usingHuggingFace(
      user,
      prompt,
      max_tokens,
      model,
      num_suggestions,
      _messages,
      customKey
    );
  } else {
    return failure("invalid model");
  }

  console.log({ result });

  if (!result.success) {
    return result;
  } else {
    if (!customKey) {
      await updateUsage(user, result.data.usage);
    }
    return success({ choices: result.data.choices });
  }
}

async function usingReplicate(
  user,
  prompt,
  max_tokens = 500,
  _model = "vicuna-13b",
  num_suggestions = 1,
  _messages = null,
  customKey
) {
  if (!user.admin) {
    return failure("sorry, only admins can use replicate models");
  }
  const models = {
    "vicuna-13b":
      "replicate/vicuna-13b:6282abe6a492de4145d7bb601023762212f9ddbbe78278bd6771c8b3b2f2a13b",
    "llama-7b":
      "replicate/llama-7b:ac808388e2e9d8ed35a5bf2eaa7d83f0ad53f9e3df31a42e4eb0a0c3249b3165",
    "stablelm-tuned-alpha-7b":
      "stability-ai/stablelm-tuned-alpha-7b:c49dae362cbaecd2ceabb5bd34fdb68413c4ff775111fea065d259d577757beb",
    "flan-t5-xl":
      "replicate/flan-t5-xl:7a216605843d87f5426a10d2cc6940485a232336ed04d655ef86b91e020e9210",
  };
  const model = models[_model];

  if (!model) {
    return failure(`invalid model ${_model}`);
  }

  const input = {
    prompt,
  };
  const output = await replicate.run(model, { input });
  console.log(output);
  return success({ choices: [{ text: output.join("") }], usage: 0 });
}

function sanitize(str) {
  return str
    .split(" ")
    .map((word) => {
      if (blocklist.includes(word.toLowerCase())) {
        return "****";
      } else {
        return word;
      }
    })
    .join(" ");
}

async function getEmbeddings(user, _text) {
  const check = checkUsage(user);
  if (!check.success) {
    return check;
  }

  const input = _text.substring(0, settings.maxPromptLength);

  const endpoint = "https://api.openai.com/v1/embeddings";
  const reqBody = {
    input,
    model: "text-embedding-ada-002",
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.openAiApiKey}`,
    },
    body: JSON.stringify(reqBody),
  });
  const json = await res.json();
  console.log({ json });
  if (json.error) {
    return failure(json.error.message);
  }
  await updateUsage(user, json.usage);

  if (json.data) {
    const embeddings = json.data[0].embedding;
    return success(embeddings);
  }
  return failure("no data for embeddings");
}
async function usingHuggingFace(
  user,
  prompt,
  max_tokens = 500,
  _model = "vicuna-13b",
  num_suggestions = 1,
  _messages = null,
  customKey
) {
  if (!user.admin) {
    return failure("sorry, only admins can use huggingface models");
  }
  /*   const models = {
    "vicuna-13b":
      "replicate/vicuna-13b:6282abe6a492de4145d7bb601023762212f9ddbbe78278bd6771c8b3b2f2a13b",
    "llama-7b":
      "replicate/llama-7b:ac808388e2e9d8ed35a5bf2eaa7d83f0ad53f9e3df31a42e4eb0a0c3249b3165",
    "stablelm-tuned-alpha-7b":
      "stability-ai/stablelm-tuned-alpha-7b:c49dae362cbaecd2ceabb5bd34fdb68413c4ff775111fea065d259d577757beb",
    "flan-t5-xl":
      "replicate/flan-t5-xl:7a216605843d87f5426a10d2cc6940485a232336ed04d655ef86b91e020e9210",
  };
 */ const model = "gpt2";

  if (!model) {
    return failure(`invalid model ${_model}`);
  }

  const input = {
    prompt,
  };

  const inference = new HfInference(settings.huggingFaceApiKey);

  const output = await inference.textGeneration({
    model,
    inputs: prompt,
  });

  console.log(output);
  return success({ choices: [{ text: output.generated_text }], usage: 0 });
}

async function usingOpenAi(
  user,
  _prompt,
  max_tokens = 500,
  model = "gpt-3.5-turbo",
  num_suggestions = 1,
  _messages = null,
  customKey
) {
  const chatModels = ["gpt-3.5-turbo"];
  let endpoint = "https://api.openai.com/v1/completions";

  const prompt = sanitize(_prompt);
  console.log({ prompt });
  let reqBody = {
    prompt,
    max_tokens,
    model,
    n: num_suggestions,
  };
  if (chatModels.includes(model)) {
    endpoint = "https://api.openai.com/v1/chat/completions";

    let messages = _messages;
    if (messages === null || messages.length === 0) {
      messages = [{ role: "user", content: prompt }];
    }
    reqBody = {
      messages,
      max_tokens,
      model,
      n: num_suggestions,
    };
  }

  console.log(JSON.stringify(reqBody));
  const bearerKey = customKey || settings.openAiApiKey;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearerKey}`,
    },
    body: JSON.stringify(reqBody),
  });
  const json = await res.json();

  console.log({ json });

  if (json.error) {
    return failure(json.error.message);
  }

  let choices;
  if (chatModels.includes(model)) {
    choices = json.choices.map((choice) => ({
      text: choice.message.content,
    }));
  } else {
    choices = json.choices.map((choice) => ({ text: choice.text }));
  }
  return success({ choices, usage: json.usage });
}
