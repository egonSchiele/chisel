/**
 * @jest-environment jsdom
 */

import renderer from "react-test-renderer";
import ChapterList from "./ChapterList";
import React from "react";
import { chapter1 } from "../__mocks__/mocks";
import { BrowserRouter } from "react-router-dom";

it("shows the ChapterList panel", () => {
  const props = {
    chapters: [chapter1],
    bookid: "book_1",
    selectedChapterId: "chapter_1",
    onChange: () => {},
    saveChapter: () => {},
    closeSidebar: () => {},
    dispatch: () => {},
    canCloseSidebar: true,
  };
  const component = renderer.create(
    <BrowserRouter>
      <ChapterList {...props} />
    </BrowserRouter>
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
