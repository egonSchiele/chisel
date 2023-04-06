import * as React from "react";
import * as ReactDOM from "react-dom/client";
import App from "./src/App";
import { BrowserRouter } from "react-router-dom";
const domNode = document.getElementById("root");
const root = ReactDOM.createRoot(domNode);
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
