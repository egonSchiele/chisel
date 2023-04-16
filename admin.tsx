import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./src/App";
import Users from "./src/admin/Users";
import "./src/globals.css";

const domNode = document.getElementById("root");
const root = ReactDOM.createRoot(domNode);
root.render(
  <BrowserRouter>
    <Users />
  </BrowserRouter>,
);
