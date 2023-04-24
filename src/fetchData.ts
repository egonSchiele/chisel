import * as t from "./Types";
import { getCsrfToken } from "./utils";

export const fetchBook = async (bookid: string): Promise<t.Result> => {
  if (!bookid) return t.error("No bookid");
  const res = await fetch(`/api/book/${bookid}`, { credentials: "include" });
  if (!res.ok) {
    return t.error(res.statusText);
  }
  const data: t.Book = await res.json();

  if (!data) {
    return t.error("Book not found");
  }

  return t.success(data);
};

export const fetchSettings = async () => {
  const res = await fetch(`/api/settings`, { credentials: "include" });
  if (!res.ok) {
    return t.error(res.statusText);
  }
  const data = await res.json();

  if (!data) {
    return t.error("Settings not found");
  }
  return t.success(data.settings);
};

export const fetchSuggestions = async (
  text: string,
  model: string,
  num_suggestions: number,
  max_tokens: number,
  _prompt: string,
  label: string
) => {
  const prompt = _prompt.replaceAll("{{text}}", text);
  const body = JSON.stringify({
    prompt,
    model,
    max_tokens,
    num_suggestions,
    csrfToken: getCsrfToken()
  });

  const res = await fetch("/api/suggestions", {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (!res.ok) {
    return t.error(res.statusText);
  }

  const data = await res.json();

  if (!data) {
    return t.error("Suggestions not found");
  }
  if (data.error) {
    return t.error(data.error);
  }
  if (!data.choices) {
    return t.error("No choices returned.");
  }

  return t.success(data.choices);
};

export const newChapter = async (
  bookid: string,
  title: string,
  text: string
) => {
  const body = JSON.stringify({
    bookid,
    title,
    text,
    csrfToken: getCsrfToken()
  });
  const res = await fetch("/api/newChapter", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body
  });
  if (!res.ok) {
    return t.error(res.statusText);
  }
  const data = await res.json();
  return t.success(data);
};

export async function deleteBook(bookid: string) {
  const res = await postWithCsrf(`/api/deleteBook`, { bookid });

  if (!res.ok) {
    return t.error(res.statusText);
  }
  return t.success();
}

export async function favoriteBook(bookid: string) {
  const res = await postWithCsrf(`/api/favoriteBook`, { bookid });

  if (!res.ok) {
    return t.error(res.statusText);
  }
  return t.success();
}

export async function newBook() {
  const res = await postWithCsrf(`/api/newBook`, {});
  if (!res.ok) {
    return t.error(res.statusText);
  }
  const book = await res.json();
  return t.success(book);
}

export async function fetchSynonyms(word: string) {
  if (!word) return t.error("No word");

  const res = await fetch(`https://api.datamuse.com/words?ml=${word}&max=20`);
  if (!res.ok) {
    return t.error(res.statusText);
  }
  const response = await res.json();

  const synonyms = response.map((item) => item.word);
  return t.success(synonyms);
}

export async function postWithCsrf(url: string, body: any) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ ...body, csrfToken: getCsrfToken() })
  });
  return res;
}
