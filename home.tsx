import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import Home from "./src/Home";
import "./src/globals.css";

const domNode = document.getElementById("root");
const root = ReactDOM.createRoot(domNode);
root.render(
  <BrowserRouter>
    <Home />
  </BrowserRouter>
);
