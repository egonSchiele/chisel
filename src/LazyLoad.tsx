import React from "react";
import { useRef } from "react";

export default function LazyLoad({ parentScroll, screenHeight, children }) {
  const div = useRef<HTMLDivElement>(null);

  let shouldShow = false;
  if (div.current) {
    shouldShow = parentScroll + screenHeight > div.current.offsetTop;
    shouldShow = false;
  }
  return (
    <div>
      <div ref={div} />
      <div>{shouldShow && children}</div>
    </div>
  );
}
