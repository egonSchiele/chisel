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
import CodeBlock from "./components/CodeBlock";
import MarkdownBlock from "./components/MarkdownBlock";
export default function Editor() {
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
                if (text.type === "code") {
                  return (
                    <CodeBlock
                      text={text.text}
                      language={text.language}
                      key={index}
                    />
                  );
                } else if (text.type === "markdown") {
                  return <MarkdownBlock text={text.text} key={index} />;
                } else {
                  return (
                    <pre key={index} className="typography font-sans">
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
          />
        ))}
        {/* bottom padding */}
        <div className="h-24" />
      </div>
    </div>
  );
}
