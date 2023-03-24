import * as React from "react";
import * as ReactDOM from "react-dom/client";
import TextEditor from "./src/TextEditor";
import App from "./src/App";
import Book from "./src/Book";
import Test from "./src/Test";

const domNode = document.getElementById("root");
const root = ReactDOM.createRoot(domNode);
//root.render(<App />);
root.render(<Book />);
//root.render(<Test />);
