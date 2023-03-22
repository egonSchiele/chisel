import * as React from "react";
import * as ReactDOM from "react-dom/client";
import TextEditor from "./src/TextEditor";
import App from "./src/App";

const domNode = document.getElementById("root");
const root = ReactDOM.createRoot(domNode);
root.render(<App />);
