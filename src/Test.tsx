import * as d3 from "d3";
import React, { useEffect, useRef } from "react";

export default function Test() {
  const root = useRef();
  useEffect(() => {
    if (!root.current) return;
    const svg = d3.select(root.current).append("svg");

    d3.select(root.current).append("p").text("Hello from D3");

    svg
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 100)
      .attr("height", 100)
      .attr("fill", "red");
  }, [root.current]);
  return <div ref={root}>hiii</div>;
}
