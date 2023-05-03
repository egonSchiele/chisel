import React, { useCallback, useEffect, useRef } from "react";
import "./globals.css";
import { useDispatch, useSelector } from "react-redux";
import TextEditor from "./TextEditor";
import * as t from "./Types";
import { getChapterText, getCsrfToken, useTraceUpdate } from "./utils";
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
import { useKeyboardScroll } from "./hooks";
import SyntaxHighlighter from "./languages";
import zenburn from "react-syntax-highlighter/dist/esm/styles/hljs/zenburn";
export default function Editor({ onSave }: { onSave: () => void }) {
  const dispatch = useDispatch();
  const currentChapterTitle = useSelector(getSelectedChapterTitle);
  const currentChapterTextLength = useSelector(getSelectedChapterTextLength);
  const currentText = useSelector((state: RootState) => {
    const chapter = getSelectedChapter(state);
    return chapter ? chapter.text : [];
  });

  const currentChapterId = useSelector(
    (state: RootState) => state.library.selectedChapterId
  );

  const viewMode = useSelector((state: RootState) => state.library.viewMode);

  const readonlyDiv = useRef(null);
  useKeyboardScroll(readonlyDiv);

  if (!currentChapterTitle) {
    return <div className="flex w-full h-full">Loading</div>;
  }

  if (viewMode === "readonly") {
    return (
      <div
        ref={readonlyDiv}
        className="flex h-screen overflow-auto w-full max-w-3xl mx-auto  "
        id="readonly"
      >
        <div className="mx-auto w-full px-sm lg:px-md mb-sm h-full">
          <h1 className="text-2xl mb-sm tracking-wide font-semibold text-darkest dark:text-lightest">
            {currentChapterTitle}
          </h1>
          <div className="grid grid-col-1">
            {currentText
              .filter((t) => t.open)
              .map((text: t.TextBlock, index) => {
                if (text.syntaxHighlighting) {
                  const con = text.text.trim().replaceAll("  ", "\t");

                  return (
                    <div className="my-sm">
                      <label className="p-xs relative text-xs xl:text-sm text-gray-600 dark:text-gray-300 font-light uppercase mb-xs">
                        {text.language}
                      </label>
                      <SyntaxHighlighter
                        language={text.language}
                        style={zenburn}
                      >
                        {con}
                      </SyntaxHighlighter>
                    </div>
                  );
                } else {
                  return (
                    <pre
                      key={index}
                      className="typography font-sans first:first-letter:text-5xl first:first-letter:font-bold"
                    >
                      {text.text}
                    </pre>
                  );
                }
              })}
          </div>
          <div className="h-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-auto w-full max-w-3xl mx-auto  ">
      <div className="mx-auto w-full px-sm lg:px-md mb-sm h-full">
        <ContentEditable
          value={currentChapterTitle}
          className="text-2xl mb-sm tracking-wide font-semibold text-darkest dark:text-lightest"
          /* // This is needed so the first block gets focus when we hit enter
          onClick={() => {
            dispatch(librarySlice.actions.setActiveTextIndex(-1));
          }} */
          onSubmit={(title) => {
            dispatch(librarySlice.actions.setTitle(title));
          }}
          nextFocus={() => {
            dispatch(librarySlice.actions.setActiveTextIndex(0));
          }}
          selector="text-editor-title"
        />
        {currentText.map((text, index) => (
          <TextEditor
            chapterid={currentChapterId}
            index={index}
            key={text.id || index}
            onSave={onSave}
          />
        ))}
        {/* bottom padding */}
        <div className="h-24" />
      </div>
    </div>
  );
}
