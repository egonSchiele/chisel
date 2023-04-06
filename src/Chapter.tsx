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
  console.log({ width, height });
  const updateChapterPosition = (e, data) => {
    console.log(data);
    const newChapter = { ...chapter };
    newChapter.pos = { ...chapter.pos };
    newChapter.pos.x = Math.round(data.x / width);
    newChapter.pos.y = Math.round(data.y / height);
    /* data.x = Math.round(data.x / width) * width; */
    onChange(newChapter);
    //dispatch({ type: "setChapter", payload: chapter });
    //saveChapter();
  };

  return (
    <Draggable
      grid={[width, height]}
      handle=".handle"
      defaultPosition={{ x: chapter.pos.x * width, y: chapter.pos.y * height }}
      onStop={updateChapterPosition}
      bounds="parent"
    >
      <div
        className={`shadow absolute p-xs m-0 dark:bg-dmchaptercard hover:bg-dmchaptercardhover  dark:text-dmtext w-chapter h-chapter select-none`}
      >
        <div className="handle cursor-move uppercase text-sm font-semibold border-b-2 mb-xs text-highlight">
          {chapter.title}
        </div>
        <Link to={`/chapter/${chapter.chapterid}`}>
          <div className="h-3/4 dark:bg-dmchaptercardhover p-xs overflow-hidden">
            {/*  {chapter.pos.x}, {chapter.pos.y}  */}
            {chapter.text}
          </div>
        </Link>
      </div>
    </Draggable>
  );
}
