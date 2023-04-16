import { findSubarray, normalize, split } from "./utils";

test("split string", () => {
  expect(split("hi there!")).toEqual(["hi", "there!"]);
});

test("split string with newline", () => {
  expect(split("hi\nthere!")).toEqual(["hi\n", "there!"]);
});

test("normalize", () => {
  expect(normalize("Hi\n thEre hippos!")).toEqual("hi there hippos");
});

test("find subarray", () => {
  expect(findSubarray([1, 2, 3, 4, 5], [3, 4])).toEqual(2);
});

test("find subarray not found", () => {
  expect(findSubarray([1, 2, 3, 4, 5], [3, 5])).toEqual(-1);
});
