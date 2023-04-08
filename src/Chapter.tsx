/* OLD DEPRECATED CODE */
import Draggable from "react-draggable"; // The default
import { Routes, Route, Link } from "react-router-dom";

import React, { useEffect, useReducer, useRef, useState } from "react";
import Panel from "./components/Panel";
import * as t from "./Types";
export default function Chapter({
  chapter,
  onChange,
  dispatch,
  width,
  height,
}) {
  /* const WIDTH = 250;
  const HEIGHT = 100;
 */
  const updateChapterPosition = (e, data) => {
    console.log(data.x, data.y);
    console.log("old", chapter.chapterid, chapter.pos.x, chapter.pos.y);
    const newChapter = { ...chapter };
    newChapter.pos = { ...chapter.pos };
    newChapter.pos.x = Math.round(data.x / width);
    newChapter.pos.y = Math.round(data.y / height);
    /* data.x = Math.round(data.x / width) * width; */
    console.log("new", newChapter.chapterid, newChapter.pos.x, newChapter.pos.y);
    onChange(newChapter);
    //dispatch({ type: "setChapter", payload: chapter });
    //saveChapter();
  };
const def = JSON.stringify({ x: chapter.pos.x * width, y: chapter.pos.y * height })
  return (
    <Draggable
      grid={[width, height]}
      handle=".handle"
      position={{ x: chapter.pos.x * width, y: chapter.pos.y * height }}
      onStop={updateChapterPosition}
      bounds="parent"
    >
      <div
        className={`shadow absolute p-xs m-0 dark:bg-dmsidebar dark:hover:bg-gray-600  dark:text-dmtext w-chapter h-chapter select-none overflow-hidden border border-dmlistBorder`}
      >
        <div className="handle cursor-move uppercase text-sm font-semibold m-xs mb-0 text-gray-700 dark:text-gray-400">
          {chapter.title}{/*  | {chapter.chapterid} */}
        </div>
        <Link to={`/book/${chapter.bookid}/chapter/${chapter.chapterid}`}>
          <div className="text-sm m-xs mt-0 overflow-hidden inline-block h-24">
             {/* {chapter.pos.x}, {chapter.pos.y}, {def} */}
            {chapter.text}
            , 
          </div>
        </Link>
      </div>
    </Draggable>
  );
}
