import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./src/store";
import AppMobile from "./src/AppMobile";

const domNode = document.getElementById("root");
const root = ReactDOM.createRoot(domNode);
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <AppMobile />
    </BrowserRouter>
  </Provider>
);
