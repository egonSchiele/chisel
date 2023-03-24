import Draggable from "react-draggable"; // The default
import { Routes, Route, Link } from "react-router-dom";

import React, { useEffect, useReducer, useRef, useState } from "react";
import Panel from "./components/Panel";
import * as t from "./Types";
export default function Chapter({ chapterid, title, text, x = 0, y = 0 }) {
  return (
    <Draggable
      grid={[240, 75]}
      handle=".handle"
      defaultPosition={{ x, y }}
      onStart={console.log}
      onDrag={console.log}
      onStop={console.log}
      onMouseDown={console.log}
    >
      <div
        className={`divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow w-48 my-xs mx-auto p-xs cursor-pointer`}
      >
        <div className="handle uppercase text-sm font-semibold border-b-2 mb-xs">
          {title}
        </div>
        <Link to={`/chapter/${chapterid}`}>
          <div>{text}</div>
        </Link>
      </div>
    </Draggable>
  );
}
