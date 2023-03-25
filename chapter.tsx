import * as React from "react";
import * as ReactDOM from "react-dom/client";
import TextEditor from "./src/TextEditor";
import Editor from "./src/Editor";

import { BrowserRouter } from "react-router-dom";
import Library from "./src/Library";
import App from "./src/App";
const domNode = document.getElementById("root");
const root = ReactDOM.createRoot(domNode);

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
//root.render(<Test />);
