import { Routes, Route } from "react-router-dom";
import React, { useEffect } from "react";
import Book from "./Book";
import Editor from "./Editor";
import * as t from "./Types";

/* const column1: t.Column = {
  title: "Column 1",
  chapters: [chapter1, chapter2],
};

const column2: t.Column = {
  title: "Column 2",
  chapters: [chapter3],
};
 */

const chapter1: t.Chapter = {
  chapterid: "1",
  title: "Chapter 1",
  text: "Chapter 1 content",
  pos: { x: 0, y: 0 },
};

const chapter2: t.Chapter = {
  chapterid: "2",
  title: "Chapter 2",
  text: "Chapter 2 content",
  pos: { x: 0, y: 1 },
};

const chapter3: t.Chapter = {
  chapterid: "3",
  title: "Chapter 3",
  text: "Chapter 3 content",
  pos: { x: 1, y: 0 },
};

const initialState: t.Book = {
  bookid: "1",
  title: "Grokking Writing",
  author: "Aditya Bhargava",
  chapters: [chapter1, chapter2, chapter3],
};

import produce from "immer";

function reducer(state: t.Book, action: any) {
  return produce(state, (draft: t.Book) => {
    switch (action.type) {
      case "SET_TITLE":
        {
          const { chapterID, newTitle } = action.payload;
          const chapter = draft.chapters.find(
            (ch) => ch.chapterid === chapterID
          );
          if (chapter) {
            chapter.title = newTitle;
          }
        }
        break;
      case "SET_TEXT":
        {
          const { chapterID, newText } = action.payload;
          const chapter = draft.chapters.find(
            (ch) => ch.chapterid === chapterID
          );
          if (chapter) {
            chapter.text = newText;
          }
        }
        break;
      default:
        break;
    }
  });
}

export default function App() {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  function setTitle(chapterID: string, newTitle: string) {
    dispatch({ type: "SET_TITLE", payload: { chapterID, newTitle } });
  }

  function setText(chapterID: string, newText: string) {
    dispatch({ type: "SET_TEXT", payload: { chapterID, newText } });
  }

  useEffect(() => {
    syncBookToFirestore(state);
  }, []);

  let prevBookJSON: string = JSON.stringify(initialState);

  async function syncBookToFirestore(book: t.Book) {
    const currentBookJSON = JSON.stringify(book);

    /*     if (prevBookJSON !== currentBookJSON) {
      prevBookJSON = currentBookJSON;
    } */

    const body = JSON.stringify({
      book: currentBookJSON,
    });

    fetch("/api/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });
  }

  return (
    <Routes>
      <Route path="/" element={<Book book={state} />} />
      <Route
        path="/chapter/:chapterid"
        element={<Editor book={state} setTitle={setTitle} setText={setText} />}
      />
    </Routes>
  );
}
