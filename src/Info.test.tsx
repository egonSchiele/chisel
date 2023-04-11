const renderer = require("react-test-renderer");
const Info = require("./Info");
const React = require("react");

it("changes the class when hovered", () => {
  const component = renderer.create(<Info text="This is a test" />);
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
