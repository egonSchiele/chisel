import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./src/App";
import { Provider } from 'react-redux';
import { store } from './src/store';

const domNode = document.getElementById("root");
const root = ReactDOM.createRoot(domNode);
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
);
