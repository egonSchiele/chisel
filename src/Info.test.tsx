// @ts-nocheck
import renderer from "react-test-renderer";
import React from "react";
import Info from "./Info";
import { Provider } from "react-redux";

import { store } from "./store";

it("shows the info panel", () => {
  const component = renderer.create(
    <Provider store={store}>
      <Info text="hi there syllables" />
    </Provider>
  );
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
