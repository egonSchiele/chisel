/**
 * @jest-environment jsdom
 */

import renderer from "react-test-renderer";
import ChapterList from "./ChapterList";
import React from "react";
import { chapter1, chapter2 } from "../__mocks__/mocks";
import { BrowserRouter } from "react-router-dom";
import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { act } from "react-dom/test-utils";

const props = {
  chapters: [chapter1, chapter2],
  bookid: "book_1",
  selectedChapterId: "chapter_1",
  onChange: () => {},
  saveChapter: () => {},
  closeSidebar: () => {},
  dispatch: () => {},
  canCloseSidebar: true,
};

it("shows the ChapterList panel", () => {
  const component = renderer.create(
    <BrowserRouter>
      <ChapterList {...props} />
    </BrowserRouter>
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

describe("ChapterList", () => {
  let container;
  beforeEach(() => {
    const res = render(
      <BrowserRouter>
        <ChapterList {...props} />
      </BrowserRouter>
    );
    container = res.container;
  });
  it("has chapter titles", () => {
    expect(screen.getByText("New job")).toBeInTheDocument();
    expect(
      screen.getByText("new chapter fresh from the oven")
    ).toBeInTheDocument();
  });
  /*  it("switches to edit mode when user clicks reorder", () => {
    act(() => {
      expect(screen.queryByText("Editing")).toBeNull();
      const button = container.querySelector(`[data-selector="chapter-menu"]`);

      fireEvent.click(button);

      expect(screen.getByText("Reorder")).toBeInTheDocument();
    });
  }); */
});
