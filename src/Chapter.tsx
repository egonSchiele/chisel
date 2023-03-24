import Draggable from "react-draggable"; // The default

import React, { useEffect, useReducer, useRef, useState } from "react";
import Panel from "./components/Panel";
import * as t from "./Types";
export default function Chapter({ title, text, x = 0, y = 0 }) {
  return (
    <Draggable
      grid={[250, 75]}
      handle=".handle"
      defaultPosition={{ x, y }}
      onStart={console.log}
      onDrag={console.log}
      onStop={console.log}
      onMouseDown={console.log}
    >
      <div
        className={`divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow w-48 my-sm mx-sm cursor-pointer`}
      >
        <div className="handle">{title}</div>
        <div>{text}</div>
      </div>
    </Draggable>
  );
}
