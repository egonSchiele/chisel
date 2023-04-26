import React, { useCallback } from "react";
import "./globals.css";
import { useDispatch, useSelector } from "react-redux";
import TextEditor from "./TextEditor";
import * as t from "./Types";
import { getCsrfToken, useTraceUpdate } from "./utils";
import { RootState } from "./store";
import {
  getSelectedChapter,
  getSelectedChapterTextLength,
  getSelectedChapterTitle,
  librarySlice,
} from "./reducers/librarySlice";
import { postWithCsrf } from "./fetchData";
import Button from "./components/Button";
import ContentEditable from "./components/ContentEditable";
import _ from "lodash";

export default function Editor({ onSave }: { onSave: () => void }) {
  const dispatch = useDispatch();
  const currentChapterTitle = useSelector(getSelectedChapterTitle);
  const currentChapterTextLength = useSelector(getSelectedChapterTextLength);
  const currentChapterId = useSelector(
    (state: RootState) => state.library.selectedChapterId
  );

  if (!currentChapterTitle) {
    return <div className="flex w-full h-full">Loading</div>;
  }

  return (
    <div className="flex w-full h-full">
      <div className="w-full h-full col-span-4">
        <div className="h-0 pb-1 w-full flex">
          <div className="flex flex-none" />
          <div className="flex flex-grow" />
        </div>
        <div className="h-screen overflow-scroll w-full">
          <div className="mx-auto max-w-7xl px-sm lg:px-md mb-sm h-full">
            <ContentEditable
              value={currentChapterTitle}
              className="text-2xl mb-sm tracking-wide font-semibold text-darkest dark:text-lightest"
              onSubmit={(title) => {
                dispatch(librarySlice.actions.setTitle(title));
              }}
              nextFocus={() => {
                dispatch(librarySlice.actions.setActiveTextIndex(0));
              }}
              selector="text-editor-title"
            />
            {_.range(0, currentChapterTextLength).map((index) => (
              <TextEditor
                chapterid={currentChapterId}
                index={index}
                key={index}
                onSave={onSave}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
