import Draggable from "react-draggable"; // The default

import React, { useEffect, useReducer, useRef, useState } from "react";
import Panel from "./components/Panel";
import * as t from "./Types";
export default function Chapter({ title, text }) {
  const chapterRef = useRef();

  const [mouseDown, _setMouseDown] = useState(false);
  const [drawCoords, _setDrawCoords] = useState<t.Coords>({
    x: 0,
    y: 0,
    w: 100,
    h: 100,
  });

  // Create a ref
  const drawCoordsRef = useRef(drawCoords);
  // And create our custom function in place of the original setdrawCoords
  function setDrawCoords(coords: t.Coords) {
    drawCoordsRef.current = coords; // Updates the ref
    _setDrawCoords(coords);
  }

  // Create a ref
  const mouseDownRef = useRef(mouseDown);
  // And create our custom function in place of the original setmouseDown
  function setMouseDown(bool: boolean) {
    mouseDownRef.current = bool; // Updates the ref
    _setMouseDown(bool);
  }

  useEffect(() => {
    if (!chapterRef.current) return;
    console.log(mouseDown, "<<<<");
    const canvas = chapterRef.current as any;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeRect(drawCoords.x, drawCoords.y, 100, 100);

    ctx.font = "18px serif";
    ctx.fillText(title, drawCoords.x + 10, drawCoords.y + 50);

    //ctx.fill();
  }, [chapterRef.current, drawCoords]);

  useEffect(() => {
    if (!chapterRef.current) return;

    const canvas = chapterRef.current as any;

    canvas.addEventListener("mousedown", (e) => {
      setMouseDown(true);
      console.log(e);
      setDrawCoords({
        x: e.offsetX,
        y: e.offsetY,
        w: 0,
        h: 0,
      });
    });

    canvas.addEventListener("mousemove", (e) => {
      if (mouseDownRef.current) {
        console.log("mousedown??", mouseDown);
        setDrawCoords({
          x: e.offsetX - 50,
          y: e.offsetY - 50,
          w: 0,
          h: 0,
        });
      }
    });

    canvas.addEventListener("mouseup", (e) => {
      setMouseDown(false);
    });
  }, [chapterRef.current]);

  return (
    <Draggable grid={[250, 25]} axis="x">
      <div>
        <div className="handle">Drag from here</div>
        <div>This readme is really dragging on...</div>
      </div>
    </Draggable>
  );

  return <canvas ref={chapterRef}></canvas>;
}
