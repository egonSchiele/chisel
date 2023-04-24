import React from "react";
import "./globals.css";
import { useDispatch, useSelector } from "react-redux";
import TextEditor from "./TextEditor";
import * as t from "./Types";
import { getCsrfToken } from "./utils";
import { RootState } from "./store";
import { getSelectedChapter, librarySlice } from "./reducers/librarySlice";
import { postWithCsrf } from "./fetchData";
import Button from "./components/Button";
import ContentEditable from "./components/ContentEditable";

export default function Editor({
  onSave,
}: {
  onSave: (state: t.State) => void;
}) {
  const state = useSelector((state: RootState) => state.library);
  const dispatch = useDispatch();
  const currentChapter = useSelector(getSelectedChapter);

  if (!currentChapter) {
    return <div className="flex w-full h-full">Loading</div>;
  }

  console.log(currentChapter.text, "!!");

  return (
    <div className="flex w-full h-full">
      <div className="w-full h-full col-span-4">
        <div className="h-0 pb-1 w-full flex">
          <div className="flex flex-none" />
          <div className="flex flex-grow" />
        </div>
        <div className="h-screen overflow-scroll w-full">
          <div className="mx-auto max-w-7xl px-sm lg:px-md mb-sm h-full">
            {/*  <Button
              onClick={() => dispatch(librarySlice.actions.extractBlock())}
            >
              Extract
            </Button> */}
            <ContentEditable
              value={currentChapter.title}
              className="text-2xl mb-sm tracking-wide font-semibold text-darkest dark:text-lightest"
              onSubmit={(title) => {
                dispatch(librarySlice.actions.setTitle(title));
              }}
              selector="text-editor-title"
            />
            {currentChapter.text.map((textBlock, index) => (
              <TextEditor
                chapterid={currentChapter.chapterid}
                index={index}
                key={index}
                onSave={() => onSave(state)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
