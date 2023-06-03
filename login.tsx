import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./src/store";
import Login from "./src/Login";
import "./src/globals.css";
import LibraryContext from "./src/LibraryContext";
const domNode = document.getElementById("root");
const root = ReactDOM.createRoot(domNode);

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  </Provider>
);
