self.addEventListener("install", (event) => {
  console.log("[service worker] installed");
  self.skipWaiting();
});

const lastEditedRequest = new Request("/api/getLastEdited", {
  credentials: "include",
});

const booksRequest = new Request("/api/books", {
  credentials: "include",
});

async function lastEditedFromCache() {
  const cache = await caches.open("v1");
  const lastEditedResponse = await cache.match(lastEditedRequest);
  if (lastEditedResponse) {
    const data = await lastEditedResponse.json();
    if (data && data.lastEdited) {
      return data.lastEdited;
    }
  }
  return null;
}

async function fetchBooksFromServer() {
  const booksResponse = await fetch(booksRequest);
  const books = await booksResponse.json();
  console.log("books from server", books);
  const cache = await caches.open("v1");

  cache.put(booksRequest, new Response(JSON.stringify({ books: books.books })));
  setLastEditedInCache(books.lastEdited);
  return new Response(
    JSON.stringify({
      books: books.books,
      lastEdited: books.lastEdited,
      serviceWorkerRunning: true,
    })
  );
}

async function setLastEditedInCache(lastEdited) {
  const cache = await caches.open("v1");
  cache.put(lastEditedRequest, new Response(JSON.stringify({ lastEdited })));
  console.log("set last edited in cache to:", lastEdited);
}

async function lastEditedFromServer() {
  const result = await fetch(lastEditedRequest);
  if (!result.ok) return null;
  const data = await result.json();
  if (!data || !data.lastEdited) return null;
  return data.lastEdited;
}

async function fetchBooksFromCache() {
  const cache = await caches.open("v1");
  const cachedBookData = await cache.match(booksRequest);
  if (!cachedBookData) {
    console.warn("no cachedBookData");
    return false;
  }
  const data = await cachedBookData.json();
  if (!data || !data.books) {
    console.warn("no data or books");
    return false;
  }
  return data.books;
}

async function updateCacheWithChapter(request) {
  const books = await fetchBooksFromCache();
  if (!books) return;
  const { chapter } = await request.json();
  const book = books.find((book) => book.bookid === chapter.bookid);
  if (!book) {
    console.warn("book not found", books, chapter);
    return false;
  }
  const chapterIndex = book.chapters.findIndex(
    (c) => c.chapterid === chapter.chapterid
  );
  if (chapterIndex === -1) {
    console.warn("chapter not found", chapter);
    return false;
  }
  book.chapters[chapterIndex] = chapter;
  const cache = await caches.open("v1");
  cache.put(booksRequest, new Response(JSON.stringify({ books: books })));
  console.log("updated cache with chapter", chapter);
  return true;
}

async function updateCacheWithBook(request) {
  const books = await fetchBooksFromCache();
  if (!books) return;
  const { book } = await request.json();
  const bookIndex = books.findIndex((b) => b.bookid === book.bookid);
  if (bookIndex === -1) {
    console.warn("book not found", books, book);
    return false;
  }
  const bookChapters = books[bookIndex].chapters;
  book.chapters = bookChapters;
  books[bookIndex] = book;
  const cache = await caches.open("v1");
  cache.put(booksRequest, new Response(JSON.stringify({ books: books })));
  console.log("updated cache with book", book);
  return true;
}

function deepEqual(obj1, obj2) {
  if (obj1 === obj2) {
    return true;
  } else if (isObject(obj1) && isObject(obj2)) {
    if (Object.keys(obj1).length !== Object.keys(obj2).length) {
      console.log(
        "keys not equal length",
        Object.keys(obj1).length,
        Object.keys(obj2).length
      );
      return false;
    }
    for (var prop in obj1) {
      if (!deepEqual(obj1[prop], obj2[prop])) {
        console.log("not equal", prop, obj1[prop], obj2[prop]);
        return false;
      }
    }
    return true;
  } else if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) {
      console.log("not equal length", obj1.length, obj2.length);
      return false;
    }
    for (var i = 0; i < obj1.length; i++) {
      if (!deepEqual(obj1[i], obj2[i])) {
        console.log("not equal", obj1[i], obj2[i]);
        return false;
      }
    }
    return true;
  }

  return false;

  // Private
  function isObject(obj) {
    if (typeof obj === "object" && obj != null) {
      return true;
    } else {
      return false;
    }
  }
}

async function getBooksFromCacheOrServer() {
  const cachedBooks = await fetchBooksFromCache();
  if (!cachedBooks) {
    console.warn("no books in cache, fetching from server");
    return fetchBooksFromServer();
  }

  const cachedLastEdited = await lastEditedFromCache();
  if (!cachedLastEdited) {
    console.warn("no last edited in cache, fetching from server");
    return fetchBooksFromServer();
  }

  const freshLastEdited = await lastEditedFromServer();
  console.log("cached last edited", cachedLastEdited);
  console.log("fresh last edited", freshLastEdited);

  if (!freshLastEdited) {
    console.warn("no last edited from server, fetching from server");
    return fetchBooksFromServer();
  }

  const compare = false;

  if (compare) {
    const res1 = await fetchBooksFromServer();
    const clone = res1.clone();
    const json = await res1.json();
    const server = json.books;
    const cache = await fetchBooksFromCache();

    console.log("server", server);
    console.log("cache", cache);
    const equal = deepEqual(server, cache);
    console.log("deep equal", equal);
    return new Response(
      JSON.stringify({
        books: server,
        lastEdited: json.lastEdited,
        deepEqual: equal,
        serviceWorkerRunning: true,
      })
    );
  } else if (cachedLastEdited < freshLastEdited) {
    console.warn("local copy is outdated, fetching from server");
    const cache = await caches.open("v1");

    // first, back up the cache data
    cache.put(
      "/api/books/backup",
      new Response(JSON.stringify({ books: cachedBooks }))
    );

    return fetchBooksFromServer();
  } else {
    console.warn("fetching local copy from cache!");
    const books = await fetchBooksFromCache();
    const lastEdited = await lastEditedFromCache();
    return new Response(
      JSON.stringify({
        books,
        lastEdited,
        serviceWorkerRunning: true,
        fromCache: true,
      })
    );
  }
}

async function saveChapter(request) {
  return await saveBase(request, updateCacheWithChapter, "chapter");
}

async function saveBook(request) {
  return await saveBase(request, updateCacheWithBook, "book");
}

async function saveBase(request, updateFunc, type) {
  const updated = await updateFunc(request.clone());
  const result = await fetch(request);
  const clone = result.clone();
  console.log("result", result, result.ok);
  if (result.ok) {
    console.log("updated on server", type);
    const data = await result.json();
    setLastEditedInCache(data.lastHeardFromServer);
  } else {
    console.log("failed to update on server", type);
  }
  return clone;
}

function clearCache() {
  console.log("clearing cache");
  caches.keys().then(function (names) {
    for (let name of names) caches.delete(name);
  });
}

self.addEventListener("fetch", async (event) => {
  console.log("[service worker] fetch", event.request.url);
  if (event.request.url.endsWith("/api/books")) {
    event.respondWith(getBooksFromCacheOrServer());
  } else if (event.request.url.endsWith("/api/saveChapter")) {
    console.log("save chapter", event.request);
    event.respondWith(saveChapter(event.request));
  } else if (event.request.url.endsWith("/api/saveBook")) {
    console.log("save book", event.request);
    event.respondWith(saveBook(event.request));
  } else if (event.request.url.endsWith("/logout")) {
    clearCache();
  }
});
