// @ts-nocheck
import renderer from "react-test-renderer";
import React from "react";
import Info from "./Info";

it("shows the info panel", () => {
  const component = renderer.create(<Info text="hi there syllables" />);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
