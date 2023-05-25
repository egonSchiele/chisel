import React, { useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import LibraryContext from "./LibraryContext";
import * as t from "./Types";
import Button from "./components/Button";
import List from "./components/List";
import {
  getSelectedBook,
  getSelectedChapter,
  getText,
} from "./reducers/librarySlice";
import { RootState } from "./store";

export default function OutlineSidebar() {
  const state = useSelector((state: RootState) => state.library.editor);
  const currentBook = useSelector(getSelectedBook);
  const index = state.activeTextIndex;
  const currentChapter = useSelector(getSelectedChapter);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!currentChapter) return null;
  const items = currentChapter!.text.map((text, i) => {
    let label = text.caption;
    if (!label) {
      label = text.text;
    }
    label = label.substring(0, 20);
    return (
      <Button
        key={i}
        rounded={true}
        style="secondary"
        size="medium"
        onClick={() => {
          navigate(
            `/book/${currentBook!.bookid}/chapter/${
              currentChapter!.chapterid
            }/${i}`
          );
        }}
        className="w-full text-left flex mb-xs"
      >
        {/* <Bars3Icon className="h-4 w-4 flex-none mr-xs" aria-hidden="true" />{" "} */}
        <p className="flex-grow">{label}</p>
      </Button>
    );
  });

  return (
    <List
      title="Outline"
      items={items}
      leftMenuItem={null}
      rightMenuItem={null}
      className="bg-sidebarSecondary dark:bg-dmsidebarSecondary border-r border-b border-gray-700"
      selector="outlineList"
    />
  );
}
