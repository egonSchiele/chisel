import renderer from "react-test-renderer";
import Info from "./Info";
import React from "react";

it("shows the info panel", () => {
  const component = renderer.create(<Info text="hi there syllables" />);
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
