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
    console.log(
      "new",
      newChapter.chapterid,
      newChapter.pos.x,
      newChapter.pos.y
    );
    onChange(newChapter);
    //dispatch({ type: "SET_CHAPTER", payload: chapter });
    //saveChapter();
  };
  const def = JSON.stringify({
    x: chapter.pos.x * width,
    y: chapter.pos.y * height,
  });
  const small = width <= 100;
  return (
    <Draggable
      grid={[width, height]}
      handle=".handle"
      position={{ x: chapter.pos.x * width, y: chapter.pos.y * height }}
      onStop={updateChapterPosition}
      bounds="parent"
    >
      <div
        className={`shadow absolute m-0 dark:bg-dmsidebar dark:hover:bg-gray-600  dark:text-dmtext select-none overflow-hidden border border-dmlistBorder`}
        style={{
          height: `${height}px`,
          width: `${width}px`,
        }}
      >
        {!small && (
          <div>
            <div
              className={`handle cursor-move uppercase font-semibold p-xs text-gray-700 dark:text-black dark:bg-slate-400 text-sm`}
            >
              {chapter.title}
              {/*  | {chapter.chapterid} */}
            </div>
            <Link to={`/book/${chapter.bookid}/chapter/${chapter.chapterid}`}>
              <div className="text-sm m-xs overflow-hidden inline-block w-full h-20 dark:bg-dmsidebar dark:hover:bg-gray-600">
                {/* {chapter.pos.x}, {chapter.pos.y}, {def} */}
                {chapter.text || "..."}
              </div>
            </Link>
          </div>
        )}

        {small && (
          <div className="h-18 text-center">
            <div
              className={`handle cursor-move uppercase font-semibold p-0 text-gray-700 dark:text-black dark:bg-slate-400 text-xs h-9 max-h-9 overflow-hidden pt-1`}
            >
              {chapter.title}
            </div>
            <Link
              to={`/book/${chapter.bookid}/chapter/${chapter.chapterid}`}
              className="h-9 block
        "
            >
              <div className="pt-1"> Edit</div>
            </Link>
          </div>
        )}
      </div>
    </Draggable>
  );
}
