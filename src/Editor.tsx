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
import _ from "lodash";

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

  const handleKeyDown = async (event) => {
    if (!readonlyDiv.current) return;
    const div = readonlyDiv.current;
    if (event.shiftKey && event.code === "Space") {
      event.preventDefault();
      div.scroll({ top: div.scrollTop + 800, behavior: "smooth" });
    } else if (event.code === "Space") {
      event.preventDefault();
      div.scroll({ top: div.scrollTop + 400, behavior: "smooth" });
    } else if (event.metaKey && event.code === "ArrowDown") {
      event.preventDefault();
      div.scroll({ top: div.scrollHeight, behavior: "smooth" });
    } else if (event.metaKey && event.code === "ArrowUp") {
      event.preventDefault();
      div.scroll({ top: 0, behavior: "smooth" });
    } else if (event.code === "ArrowDown") {
      event.preventDefault();
      div.scroll({ top: div.scrollTop + 400, behavior: "smooth" });
    } else if (event.code === "ArrowUp") {
      event.preventDefault();
      div.scroll({ top: div.scrollTop - 400, behavior: "smooth" });
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, readonlyDiv]);

  if (!currentChapterTitle) {
    return <div className="flex w-full h-full">Loading</div>;
  }

  if (viewMode === "readonly") {
    return (
      <div
        ref={readonlyDiv}
        className="flex h-screen overflow-auto w-full max-w-3xl mx-auto  "
      >
        <div className="mx-auto w-full px-sm lg:px-md mb-sm h-full">
          <h1 className="text-2xl mb-sm tracking-wide font-semibold text-darkest dark:text-lightest">
            {currentChapterTitle}
          </h1>
          <div className="grid grid-col-1">
            {currentText.map((text, index) => (
              <pre
                key={index}
                className="typography font-sans first:first-letter:text-5xl first:first-letter:font-bold"
              >
                {text.text}{" "}
              </pre>
            ))}
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
