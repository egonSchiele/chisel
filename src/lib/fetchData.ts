import * as t from "../Types";
import { getCsrfToken, tryJson } from "../utils";

export const fetchSettings = async () => {
  const res = await fetch(`/api/settings`, { credentials: "include" });
  if (!res.ok) {
    const text = await res.text();
    return t.error(`Error fetching settings: ${text}`);
  }
  const data = await res.json();

  if (!data) {
    return t.error("Settings not found");
  }
  return t.success(data);
};

export const fetchBookTitles = async () => {
  const res = await fetch(`/api/bookTitles`, { credentials: "include" });
  if (!res.ok) {
    const text = await res.text();
    return t.error(`Error fetching book titles: ${text}`);
  }
  const data = await res.json();

  if (!data) {
    return t.error("bookTitles not found");
  }
  return t.success(data);
};

export const fetchSuggestions = async (
  text: string,
  synopsis: string,
  model: string,
  num_suggestions: number,
  max_tokens: number,
  _prompt: string,
  messages: t.ChatHistory[] = [],
  _customKey?: string | null
) => {
  // @ts-ignore
  let prompt = _prompt.replaceAll("{{text}}", text);
  prompt = prompt.replaceAll("{{synopsis}}", synopsis);
  const customKey = _customKey || null;

  const res = await postWithCsrf(`/api/suggestions`, {
    prompt,
    model,
    max_tokens,
    num_suggestions,
    customKey,
    messages,
  });

  if (!res.ok) {
    try {
      const error = await res.json();
      return t.error(error.error);
    } catch (e) {
      return t.error(`Error fetching suggestions: ${e}`);
    }
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
  const res = await postWithCsrf(`/api/newChapter`, { bookid, title, text });

  if (!res.ok) {
    const text = await res.text();
    return t.error(`Error creating new chapter: ${text}`);
  }
  const data = await res.json();
  return t.success(data);
};

export async function deleteBook(bookid: string) {
  const res = await postWithCsrf(`/api/deleteBook`, { bookid });

  if (!res.ok) {
    const text = await res.text();
    return t.error(`Error deleting book: ${text}`);
  }
  return t.success();
}

export async function deleteChapter(bookid: string, chapterid: string) {
  const res = await postWithCsrf(`/api/deleteChapter`, { bookid, chapterid });

  if (!res.ok) {
    const text = await res.text();
    return t.error(`Error deleting book: ${text}`);
  }
  return t.success();
}

export async function favoriteBook(bookid: string) {
  const res = await postWithCsrf(`/api/favoriteBook`, { bookid });

  if (!res.ok) {
    const text = await res.text();
    return t.error(`Error favoriting book: ${text}`);
  }
  return t.success();
}

export async function newBook() {
  const res = await postWithCsrf(`/api/newBook`, {});
  if (!res.ok) {
    const text = await res.text();
    return t.error(`Error creating new book: ${text}`);
  }
  const book = await res.json();
  return t.success(book);
}

export async function fetchSynonyms(word: string) {
  if (!word) return t.error("No word");

  const res = await fetch(`https://api.datamuse.com/words?ml=${word}&max=20`);
  if (!res.ok) {
    return t.error(`error fetching synonyms: ${res.statusText}`);
  }
  const response = await res.json();

  const synonyms = response.map((item) => item.word);
  return t.success(synonyms);
}

export async function fetchDefinition(word: string) {
  if (!word) return t.error("No word");

  const res = await fetch(`/api/define/${word}`);
  const response = await res.json();
  if (!res.ok) {
    return t.error(response.error);
  }

  return t.success(response);
}

export async function postWithCsrf(url: string, body: any) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...body, csrfToken: getCsrfToken() }),
  });
  return res;
}

export async function uploadBook(chapters) {
  const res = await postWithCsrf(`/api/uploadBook`, { chapters });
  if (!res.ok) {
    if (res.status === 413) {
      return t.error(`That's a big file! Keep it under 1MB.`);
    }
    const text = await res.text();
    return t.error(`Error uploading book: ${text}`);
  }
  const book = await res.json();
  return t.success(book);
}

export async function uploadAudio(audioFile) {
  const formData = new FormData();
  formData.append("audioFile", audioFile);
  formData.append("csrfToken", getCsrfToken() as string);

  const res = await fetch("/api/uploadAudio", {
    method: "POST",
    headers: {
      Accept: "*/*",
      // let browser set multipart boundary by not setting that header
    },

    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    return t.error(`Error uploading audio: ${text}`);
  }

  const data = await res.json();

  return t.success(data);
}

export async function upload(fileToUpload) {
  const formData = new FormData();
  formData.append("fileToUpload", fileToUpload);
  formData.append("csrfToken", getCsrfToken() as string);

  const res = await fetch("/api/upload", {
    method: "POST",
    headers: {
      Accept: "*/*",
      // let browser set multipart boundary by not setting that header
    },

    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    return t.error(`Error uploading: ${text}`);
  }

  const data = await res.json();

  return t.success(data);
}

export async function getEmbeddings(chapter) {
  const res = await fetch(
    `/api/getEmbeddings/${chapter.bookid}/${chapter.chapterid}`
  );
  if (!res.ok) {
    const text = await res.text();
    return t.error(`Error getting embeddings: ${text}`);
  }
  const embeddings = await res.json();
  return t.success(embeddings);
}

export async function trainOnBook(bookid) {
  const res = await fetch(`/api/trainOnBook/${bookid}`);
  if (!res.ok) {
    const text = await res.text();
    return t.error(`Error training: ${text}`);
  }
  const json = await res.json();
  return t.success(json.lastTrainedAt);
}

export async function askQuestion(bookid, question) {
  const res = await postWithCsrf(`/api/askQuestion/${bookid}`, { question });
  if (!res.ok) {
    const text = await res.text();
    return t.error(`Error asking question: ${text}`);
  }
  const json = await res.json();
  return t.success(json);
}

export async function saveToHistory(chapterid: string, text: string) {
  const res = await postWithCsrf(`/api/saveToHistory`, { chapterid, text });
  if (!res.ok) {
    const text = await res.text();
    return t.error(`Error saving to history: ${text}`);
  }
  return t.success();
}

export async function saveChapter(
  chapter: t.Chapter,
  clientidOfWriter: string
) {
  const res = await postWithCsrf(`/api/saveChapter`, {
    chapter,
    clientidOfWriter,
  });
  if (!res.ok) {
    const text = await res.text();
    return t.error(`Error saving chapter: ${text}`);
  }
  console.log("saved chapter, getting json");
  const data = await res.json();
  return t.success(data);
}

export async function saveBook(book: t.Book, clientidOfWriter: string) {
  const res = await postWithCsrf(`/api/saveBook`, { book, clientidOfWriter });
  if (!res.ok) {
    const text = await res.text();
    return t.error(`Error saving book: ${text}`);
  }
  const data = await res.json();
  return t.success(data);
}

export async function textToSpeech(bookid: string, chapterid: string) {
  const res = await postWithCsrf(
    `/textToSpeech/book/${bookid}/chapter/${chapterid}`,
    {}
  );
  if (!res.ok) {
    const text = await res.text();
    return t.error(`Error saving book: ${text}`);
  }
  const data = await res.json();
  if (data.success) {
    return t.success(data.task_id);
  }
  return t.error(data.error);
  /*   const data = await res.blob();
  const objectURL = URL.createObjectURL(data);
  window.open(objectURL, "_blank"); */
  /*   return t.success(data);
   */
}

export async function getSpeechTaskStatus(task_id: string) {
  const res = await fetch(`/textToSpeech/task/${task_id}`);
  if (!res.ok) {
    const text = await res.text();
    return t.error(`Error getting speech task: ${text}`);
  }
  const data = await res.json();
  return t.success(data);
}
