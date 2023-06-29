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
  librarySlice,
} from "./reducers/librarySlice";
import { RootState } from "./store";
import { useColors } from "./lib/hooks";
import { Square2StackIcon } from "@heroicons/react/24/outline";

export default function OutlineSidebar() {
  const state = useSelector((state: RootState) => state.library.editor);
  const currentBook = useSelector(getSelectedBook);
  const index = state.activeTextIndex;
  const currentChapter = useSelector(getSelectedChapter);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const colors = useColors();

  if (!currentChapter) return null;
  const items = currentChapter!.text.map((text, i) => {
    let label = text.caption;
    if (!label) {
      label = text.text;
    }
    label = label.substring(0, 40);
    let selectedCss = text.hideInExport
      ? "text-gray-700 dark:text-gray-500"
      : "text-gray-900 dark:text-gray-300";
    if (i === index) {
      selectedCss = "bg-gray-200 dark:bg-gray-700 dark:text-gray-200";
    }
    return (
      <li
        key={i}
        onClick={() => {
          navigate(
            `/book/${currentBook!.bookid}/chapter/${
              currentChapter!.chapterid
            }/${i}`
          );
        }}
        className={`w-full flex text-sm mb-xs cursor-pointer p-xs border-b ${colors.borderColor} ${colors.itemHover}  ${selectedCss}`}
      >
        <p
          className={`flex-grow line-clamp-1 ${
            text.type === "code" && "font-mono"
          }`}
        >
          {i + 1}. {label}
        </p>
        {text.type !== "embeddedText" &&
          text.versions &&
          text.versions.length > 0 && (
            <Square2StackIcon
              className="h-4 w-4 flex-none mr-xs"
              aria-hidden="true"
            />
          )}
      </li>
    );
  });

  items.push(
    <Button
      onClick={async () => {
        currentChapter.text.forEach((text, i) => {
          dispatch(librarySlice.actions.openBlock(i));
        });
      }}
      key="openAll"
      style="secondary"
      className="w-full my-xs"
    >
      Open All Blocks
    </Button>,
    <Button
      onClick={async () => {
        currentChapter.text.forEach((text, i) => {
          dispatch(librarySlice.actions.closeBlock(i));
        });
      }}
      key="closeAll"
      style="secondary"
      className="w-full my-xs"
    >
      Close All Blocks
    </Button>
  );

  return (
    <List
      title="Outline"
      items={items}
      leftMenuItem={null}
      rightMenuItem={null}
      selector="outlineList"
    />
  );
}
