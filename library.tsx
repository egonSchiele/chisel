import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./src/App";

const domNode = document.getElementById("root");
const root = ReactDOM.createRoot(domNode);
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
