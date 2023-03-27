import Draggable from "react-draggable"; // The default
import { Routes, Route, Link } from "react-router-dom";

import React, { useEffect, useReducer, useRef, useState } from "react";
import Panel from "./components/Panel";
import * as t from "./Types";
export default function Chapter({ chapter, onChange, dispatch }) {
  const WIDTH = 250;
  const HEIGHT = 100;

  const updateChapterPosition = (e, data) => {
    const newChapter = { ...chapter };
    newChapter.pos = { ...chapter.pos };
    newChapter.pos.x = data.x / WIDTH;
    newChapter.pos.y = data.y / HEIGHT;
    onChange(newChapter);
    //dispatch({ type: "setChapter", payload: chapter });
    //saveChapter();
  };

  return (
    <Draggable
      grid={[WIDTH, HEIGHT]}
      handle=".handle"
      defaultPosition={{ x: chapter.pos.x * WIDTH, y: chapter.pos.y * HEIGHT }}
      onStop={updateChapterPosition}
    >
      <div
        className={`divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow w-48 max-w-md my-xs mx-xs p-xs cursor-pointer absolute`}
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
