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

/* const chapter1: t.Chapter = {
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
}; */

//reducer = produce(reducer);

export default function App() {
  /*   const [prevBookJSON, setPrevBookJSON] = React.useState(
    JSON.stringify(initialState)
  );
 */
  const [error, setError] = React.useState("");
  function setTitle(chapterID: string, newTitle: string) {
    //    dispatch({ type: "SET_TITLE", payload: { chapterID, newTitle } });
  }

  function setText(chapterID: string, newText: string) {
    //  dispatch({ type: "SET_TEXT", payload: { chapterID, newText } });
  }

  /*   useInterval(() => {
    saveBook(state);
  }, 5000);
 
  async function saveBook(book: t.Book) {
    const currentBookJSON = JSON.stringify(book);

    if (prevBookJSON === currentBookJSON) {
      return;
    }
    setPrevBookJSON(currentBookJSON);
    const body = JSON.stringify({
      book: currentBookJSON,
    });

    const result = await fetch("/api/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    if (!result.ok) {
      setError(result.statusText);
      return;
    } else {
      setError("");
    }
  }
  */
  return (
    <div>
      {/* {error && <p className="p-sm bg-red-400 w-full">Error: {error}</p>} */}
      {/* {!loaded && <p className="p-sm bg-yellow-400 w-full">Loading...</p>} */}
      {
        <Routes>
          <Route path="/book/:bookid" element={<Book />} />
          <Route path="/chapter/:chapterid" element={<Editor />} />
        </Routes>
      }
    </div>
  );
}
