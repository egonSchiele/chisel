import { Routes, Route } from "react-router-dom";
import React from "react";
import Book from "./Book";
import Editor from "./Editor";
import * as t from "./Types";
const chapter1: t.Chapter = {
  chapterid: "1",
  title: "Chapter 1",
  text: "Chapter 1 content",
};

const chapter2: t.Chapter = {
  chapterid: "2",
  title: "Chapter 2",
  text: "Chapter 2 content",
};

const chapter3: t.Chapter = {
  chapterid: "3",
  title: "Chapter 3",
  text: "Chapter 3 content",
};

const column1: t.Column = {
  title: "Column 1",
  chapters: [chapter1, chapter2],
};

const column2: t.Column = {
  title: "Column 2",
  chapters: [chapter3],
};

const initialState: t.Book = {
  bookid: "1",
  title: "Grokking Writing",
  author: "Aditya Bhargava",
  columns: [column1, column2],
};

const reducer = (state: t.Book = initialState, action: any): t.Book => {
  return state;
};
export default function App() {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  return (
    <Routes>
      <Route path="/" element={<Book book={state} />} />
      <Route path="/chapter/:chapterid" element={<Editor book={state} />} />
    </Routes>
  );
}
