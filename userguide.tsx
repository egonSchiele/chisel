import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./src/globals.css";
import UserGuide from "./src/UserGuide";

const domNode = document.getElementById("root");
const root = ReactDOM.createRoot(domNode);
root.render(
  <BrowserRouter>
    <UserGuide />
  </BrowserRouter>,
);
