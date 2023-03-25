import * as React from "react";
import * as ReactDOM from "react-dom/client";
import TextEditor from "./src/TextEditor";
import Editor from "./src/Editor";
import App from "./src/App";
import Book from "./src/Book";
import Test from "./src/Test";
import { BrowserRouter } from "react-router-dom";

const domNode = document.getElementById("root");
const root = ReactDOM.createRoot(domNode);
//root.render(<Editor />);
//root.render(<Editor />);
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
//root.render(<Test />);
