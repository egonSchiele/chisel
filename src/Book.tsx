import React from "react";
import * as t from "./Types";
import Chapter from "./Chapter";
import "./globals.css";

export default function Book({ book }) {
  return (
    <div className="m-sm">
      {book.chapters.map((chapter, index) => (
        /*        <div
          key={cindex}
          className="rounded-lg w-56 h-full odd:bg-gray-300 even:bg-gray-100 mr-md shadow-sm"
        > */
        <div key={index} className="px-2 py-5">
          <Chapter
            key={index}
            chapterid={chapter.chapterid}
            title={chapter.title}
            text={chapter.text}
            x={250 * chapter.pos.x}
            y={10 * chapter.pos.y}
          />
        </div>
      ))}
    </div>
  );
}
