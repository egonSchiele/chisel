import { split } from "./utils";

test("split string", () => {
  expect(split("hi there!")).toEqual(["hi", "there!"]);
});

test("split string with newline", () => {
  expect(split("hi\nthere!")).toEqual(["hi\n", "there!"]);
});
