import React from "react";
import * as t from "./Types";
import Chapter from "./Chapter";
import "./globals.css";

export default function Book({ book }) {
  return (
    <div className="grid grid-cols-8 m-sm">
      {book.columns.map((column, cindex) => (
        <div
          key={cindex}
          className="rounded-lg w-56 h-full odd:bg-gray-300 even:bg-gray-100 mr-md shadow-sm"
        >
          <div className="px-2 py-5">
            {column.chapters.map((chapter, index) => (
              <Chapter
                key={index}
                chapterid={chapter.chapterid}
                title={chapter.title}
                text={chapter.text}
                x={0}
                y={10 * index}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
