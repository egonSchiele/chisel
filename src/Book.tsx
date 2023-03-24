import React from "react";
import * as t from "./Types";
import Chapter from "./Chapter";
import "./globals.css";

const chapter1: t.Chapter = {
  title: "Chapter 1",
  text: "Chapter 1 content",
};

const chapter2: t.Chapter = {
  title: "Chapter 2",
  text: "Chapter 2 content",
};

const chapter3: t.Chapter = {
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
  title: "Grokking Writing",
  author: "Aditya Bhargava",
  columns: [column1, column2],
};

const reducer = (state: t.Book = initialState, action: any): t.Book => {
  return state;
};

export default function Book() {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  return (
    <div className="grid grid-cols-12">
      {state.columns.map((column, cindex) => (
        <div key={cindex} className="border-2">
          {column.chapters.map((chapter, index) => (
            <Chapter
              key={index}
              title={chapter.title}
              text={chapter.text}
              x={250 * cindex}
              y={40 * index}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
