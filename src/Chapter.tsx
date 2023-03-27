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
    const newChapter = { ...chapter };
    newChapter.pos = { ...chapter.pos };
    newChapter.pos.x = data.x / width;
    newChapter.pos.y = data.y / height;
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
    >
      <div
        className={`shadow p-xs cursor-pointer dark:bg-dmbackground dark:text-dmtext w-chapter h-chapter`}
      >
        <div className="handle uppercase text-sm font-semibold border-b-2 mb-xs">
          {chapter.title}
        </div>
        <Link to={`/chapter/${chapter.chapterid}`}>
          <div>{chapter.text}</div>
        </Link>
      </div>
    </Draggable>
  );
}
