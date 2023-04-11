import * as t from "./Types";
export const fetchBook = async (bookid: string): Promise<t.Result> => {
  if (!bookid) return;
  const res = await fetch(`/api/book/${bookid}`, { credentials: "include" });
  if (!res.ok) {
    return t.error(res.statusText);
  }
  const data: t.Book = await res.json();
  console.log("got book");
  console.log(data);
  if (!data) {
    return t.error("Book not found");
  }

  if (!data.design) {
    data.design = {
      coverColor: "bg-dmlistitem2",
      labelColor: "bg-blue-700",
      labelLinesColor: "border-yellow-400",
    };
  }
  return t.success(data);
};

export const fetchBooks = async () => {
  const res = await fetch(`/books`, { credentials: "include" });
  if (!res.ok) {
    return t.error(res.statusText);
  }
  const data = await res.json();
  console.log("got books");
  console.log(data);
  if (!data) {
    return t.error("Books not found");
  }
  return t.success(data.books);
};

export const fetchSettings = async () => {
  const res = await fetch(`/api/settings`, { credentials: "include" });
  if (!res.ok) {
    return t.error(res.statusText);
  }
  const data = await res.json();
  console.log("got settings");
  console.log(data);
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
  let prompt = _prompt.replaceAll("{{text}}", text);
  const body = JSON.stringify({
    prompt,
    model,
    max_tokens,
    num_suggestions,
  });

  const res = await fetch("/api/suggestions", {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    return t.error(res.statusText);
  }

  const data = await res.json();

  if (!data) {
    return t.error("Suggestions not found");
  } else if (data.error) {
    return t.error(data.error);
  } else if (!data.choices) {
    return t.error("No choices returned.");
  }

  return t.success(data.choices);
};
