import * as React from "react";
import * as ReactDOM from "react-dom/client";
import App from "./src/App";
import { BrowserRouter } from "react-router-dom";
import Users from "./src/admin/Users";
import "./src/globals.css";
const domNode = document.getElementById("root");
const root = ReactDOM.createRoot(domNode);
root.render(
  <BrowserRouter>
    <Users />
  </BrowserRouter>
);
