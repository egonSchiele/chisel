import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import DiffViewer from "./DiffViewer";
import EmbeddedTextBlock from "./EmbeddedTextBlock";
import ReadOnlyView from "./ReadOnlyView";
import TextEditor from "./TextEditor";
import * as t from "./Types";
import Button from "./components/Button";
import ContentEditable from "./components/ContentEditable";
import Select from "./components/Select";
import "./globals.css";
import { useColors, useKeyDown, useKeyboardScroll } from "./lib/hooks";
import {
  getNextChapter,
  getPreviousChapter,
  getSelectedChapter,
  getSelectedChapterTextLength,
  getSelectedChapterTitle,
  librarySlice,
} from "./reducers/librarySlice";
import { RootState } from "./store";
import { hasVersions } from "./utils";
import { Link } from "react-router-dom";
import {
  ArrowSmallLeftIcon,
  ArrowSmallRightIcon,
} from "@heroicons/react/24/outline";
import TodoListBlock from "./TodoListBlock";
export default function Editor({ settings }: { settings: t.UserSettings }) {
  const dispatch = useDispatch();
  const currentChapterTitle = useSelector(getSelectedChapterTitle);

  const currentChapterTextLength = useSelector(getSelectedChapterTextLength);
  const currentText = useSelector((state: RootState) => {
    const chapter = getSelectedChapter(state);
    return chapter ? chapter.text : [];
  });

  const nextChapter = useSelector(getNextChapter);
  const previousChapter = useSelector(getPreviousChapter);
  const colors = useColors();

  const currentChapterId = useSelector(
    (state: RootState) => state.library.selectedChapterId
  );

  const scrollTo = useSelector((state: RootState) => state.library.scrollTo);
  /* const activeTextIndex = useSelector(
    (state: RootState) => state.library.activeTextIndex
  ); */

  const viewMode: t.ViewMode = useSelector(
    (state: RootState) => state.library.viewMode
  );

  const readonlyDiv = useRef(null);
  const editDiv = useRef(null);
  function scrollCallback(scrollTop) {
    //console.log("scrollCallback", scrollTop);
    dispatch(librarySlice.actions.setScrollTo(scrollTop));
  }
  useKeyboardScroll(readonlyDiv, 400, scrollCallback);

  useEffect(() => {
    if (scrollTo && editDiv.current) {
      // console.log("scrolling to", scrollTo);
      // console.log("scrollTop", editDiv.current.scrollTop);
      // console.log("offsetHeight", editDiv.current.offsetHeight);
      // console.log(editDiv.current);

      editDiv.current.scroll({ top: scrollTo });

      // console.log("scrollTop after", editDiv.current.scrollTop);
      dispatch(librarySlice.actions.setScrollTo(null));
    }
  }, [scrollTo, editDiv.current]);

  useKeyDown((event) => {
    if (event.ctrlKey && event.code === "KeyF") {
      if (editDiv.current) {
        event.preventDefault();
        editDiv.current.scroll({
          top: editDiv.current.scrollTop + 400,
          behavior: "smooth",
        });
      }
    }
    if (event.ctrlKey && event.code === "KeyB") {
      if (editDiv.current) {
        event.preventDefault();
        editDiv.current.scroll({
          top: editDiv.current.scrollTop - 400,
          behavior: "smooth",
        });
      }
    }
  });

  let font = settings.design ? settings.design.font : "serif";
  font = font || "serif";
  const fontClass = font === "serif" ? "serif" : "sansSerif";
  const titleFontSize = fontClass === "serif" ? "text-4xl" : "text-2xl";

  if (!currentChapterTitle) {
    return <div className="flex w-full h-full"></div>;
  }

  if (viewMode === "readonly") {
    return (
      <div
        ref={readonlyDiv}
        className="flex h-screen overflow-auto dark:[color-scheme:dark] w-full mx-auto"
        id="readonly"
      >
        <div className="mx-auto w-full max-w-md md:max-w-xl lg:max-w-2xl xl:max-w-[60rem] px-sm mb-sm h-full">
          <h1
            className={`${fontClass} ${titleFontSize} mb-md mt-lg mx-auto text-center tracking-wide font-semibold text-darkest dark:text-lightest`}
          >
            {currentChapterTitle}
          </h1>
          <div className="w-full px-xl ml-sm">
            <ReadOnlyView
              textBlocks={currentText.filter((t) => !t.hideInExport)}
              fontClass={fontClass}
            />
          </div>

          {
            <div className={`w-full flex mt-sm ${colors.secondaryTextColor}`}>
              {previousChapter && (
                <div className="flex-none">
                  <Link
                    to={`/book/${previousChapter.bookid}/chapter/${previousChapter.chapterid}`}
                  >
                    Previous: {previousChapter.title}
                  </Link>
                </div>
              )}
              <div className="flex-grow" />

              {nextChapter && (
                <div className="flex-none">
                  <Link
                    to={`/book/${nextChapter.bookid}/chapter/${nextChapter.chapterid}`}
                  >
                    Next: {nextChapter.title}
                  </Link>
                </div>
              )}
            </div>
          }

          <div className="h-24" />
        </div>
      </div>
    );
  }

  const renderedBlocks = [];
  currentText.forEach((text, index) => {
    const key = text.id || index;

    /* if (activeTextIndex) {
    isInView =
      index > activeTextIndex - 5 || index < activeTextIndex + 5;
  } else {
    isInView = index < 10;
  } */
    if (text.type === "embeddedText") {
      renderedBlocks.push(
        <EmbeddedTextBlock
          chapterid={currentChapterId}
          text={text}
          index={index}
          key={key}
        />
      );
      return;
    } else if (text.type === "todoList") {
      renderedBlocks.push(
        <TodoListBlock
          chapterid={currentChapterId}
          text={text}
          index={index}
          key={key}
        />
      );
      return;
    }
    /*   let diffWithText = "";
    if (text.diffWith) {
      const diffWith = text.versions.find(
        (version) => version.id === text.diffWith
      );
      if (diffWith) {
        diffWithText = diffWith.text;
      }
    } */

    renderedBlocks.push(
      <div key={key}>
        {/*    {text.diffWith && (
          <div className="flex overflow-auto w-full mx-[72px]">
            <DiffViewer
              originalText={text.text}
              newText={diffWithText}
              className="mx-0"
              onClose={() => {
                dispatch(
                  librarySlice.actions.setDiffWith({
                    index,
                    diffWith: null,
                  })
                );
              }}
              onApply={() => {
                dispatch(
                  librarySlice.actions.switchVersion({
                    index,
                    versionid: text.diffWith,
                  })
                );
              }}
            />
          </div>
        )} */}
        {/*   {!text.diffWith && ( */}
        <TextEditor
          chapterid={currentChapterId}
          index={index}
          settings={settings}
        />
        {/* )} */}
      </div>
    );
  });

  return (
    <div
      id="editDiv"
      className="flex h-screen dark:[color-scheme:dark] overflow-y-auto overflow-x-visible w-full"
      ref={editDiv}
    >
      <div className="mx-auto w-full max-w-md md:max-w-xl lg:max-w-2xl xl:max-w-[60rem] px-sm  mb-sm h-full ">
        <ContentEditable
          value={currentChapterTitle}
          className={`${titleFontSize} mb-md tracking-wide font-semibold text-darkest dark:text-lightest mx-auto text-center w-full mt-lg ${fontClass}`}
          /* // This is needed so the first block gets focus when we hit enter
          onClick={() => {
            dispatch(librarySlice.actions.setActiveTextIndex(-1));
          }} */
          onSubmit={(title) => {
            dispatch(
              librarySlice.actions.setTitle({
                title,
                chapterid: currentChapterId,
              })
            );
          }}
          nextFocus={() => {
            dispatch(librarySlice.actions.setActiveTextIndex(0));
          }}
          selector="text-editor-title"
        />

        {renderedBlocks}

        {/* bottom padding */}
        <div className="h-24" />
      </div>
    </div>
  );
}
