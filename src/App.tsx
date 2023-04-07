import { Routes, Route } from "react-router-dom";
import React, { useEffect } from "react";
import Book from "./Book";
import Editor from "./Editor";
import * as t from "./Types";
import Library from "./Library";

export default function App() {

  const [error, setError] = React.useState("");
  function setTitle(chapterID: string, newTitle: string) {
    //    dispatch({ type: "SET_TITLE", payload: { chapterID, newTitle } });
  }

  function setText(chapterID: string, newText: string) {
    //  dispatch({ type: "SET_TEXT", payload: { chapterID, newText } });
  }

  /*
   */
  return (
    <div>
      {/* {error && <p className="p-sm bg-red-400 w-full">Error: {error}</p>} */}
      {/* {!loaded && <p className="p-sm bg-yellow-400 w-full">Loading...</p>} */}
      {
        <Routes>
          {/*  <Route path="/book/:bookid" element={<Book />} /> */}
          <Route
            path="/book/:bookid/chapter/:chapterid"
            element={<Library />}
          />
          <Route path="/book/:bookid" element={<Library />} />
          <Route path="/" element={<Library />} />
          <Route path="/grid/:bookid" element={<Book />} />
        </Routes>
      }
    </div>
  );
}
