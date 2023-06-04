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

  const viewMode = useSelector((state: RootState) => state.library.viewMode);

  const readonlyDiv = useRef(null);
  const editDiv = useRef(null);
  function scrollCallback(scrollTop) {
    //console.log("scrollCallback", scrollTop);
    dispatch(librarySlice.actions.setScrollTo(scrollTop));
  }
  useKeyboardScroll(readonlyDiv, 400, scrollCallback);

  /*  function updateIndicatorPosition() {
    console.log("updateIndicatorPositionEDITOR");
    if (!editDiv.current) return;
    console.log("scrolling");
    console.log(editDiv.current.scrollTop);
    console.log(editDiv.current.scrollHeight);
    console.log(editDiv.current.scrollX);
    console.log(editDiv.current.scrollY);
    const scrollTop = editDiv.current.scrollTop;
    const scrollHeight = editDiv.current.scrollHeight;
    const clientHeight = editDiv.current.clientHeight;
    const widthRatio = clientHeight / scrollHeight;
    const indicatorWidth = widthRatio * 100;
    console.log({ indicatorWidth }, "%");
       indicator.style.width = indicatorWidth + "%";
    indicator.style.left =
      (scrollTop / (scrollHeight - clientHeight)) * 100 + "%"; 
  }

  useEffect(() => {
    if (editDiv.current) {
      editDiv.current.addEventListener("scroll", updateIndicatorPosition);
      return () => {
        if (editDiv.current) {
          editDiv.current.removeEventListener(
            "scroll",
            updateIndicatorPosition
          );
        }
      };
    }
  }, [editDiv.current]); */

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

  /*   useEffect(() => {
    if (editDiv.current) {
      editDiv.current.addEventListener("scroll", (event) => {
        console.log("scroll", editDiv.current.scrollTop);
      });
    }
  }, [editDiv.current]);
 */
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

  let font = settings.design ? settings.design.font : "sans-serif";
  font = font || "sans-serif";
  const fontClass = font === "serif" ? "serif" : "sansSerif";

  if (!currentChapterTitle) {
    return <div className="flex w-full h-full">Lalskdjloadasdasding</div>;
  }

  if (viewMode === "readonly") {
    return (
      <div
        ref={readonlyDiv}
        className="flex h-screen overflow-auto dark:[color-scheme:dark] w-full mx-auto"
        id="readonly"
      >
        <div className="mx-auto w-full max-w-md md:max-w-xl lg:max-w-2xl xl:max-w-4xl px-sm  mb-sm h-full">
          <h1 className="text-2xl mb-sm tracking-wide font-semibold text-darkest dark:text-lightest">
            {currentChapterTitle}
          </h1>
          <div className="w-full">
            <ReadOnlyView
              textBlocks={currentText.filter((t) => !t.hideInExport)}
              fontClass={fontClass}
            />
          </div>

          {
            <div className={`w-full flex mt-sm ${colors.secondaryTextColor}`}>
              {previousChapter && (
                <div className="flex-none">
                  {/* <ArrowSmallLeftIcon className="w-4 h-4 mr-sm" /> */}
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
                  {/*                   <ArrowSmallRightIcon className="w-4 h-4 ml-sm" />
                   */}{" "}
                </div>
              )}
            </div>
          }

          <div className="h-24" />
        </div>
      </div>
    );
  }

  return (
    <div
      id="editDiv"
      className="flex h-screen dark:[color-scheme:dark] overflow-y-auto overflow-x-visible w-full"
      ref={editDiv}
    >
      <div className="mx-auto w-full max-w-md md:max-w-xl lg:max-w-2xl xl:max-w-4xl px-sm  mb-sm h-full ">
        <ContentEditable
          value={currentChapterTitle}
          className={`text-2xl mb-sm tracking-wide font-semibold text-darkest dark:text-lightest mx-auto text-center w-full mt-sm md:mt-0 ${fontClass}`}
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

        {currentText.map((text, index) => {
          const key = text.id || index;
          let isInView = true;
          /* if (activeTextIndex) {
            isInView =
              index > activeTextIndex - 5 || index < activeTextIndex + 5;
          } else {
            isInView = index < 10;
          } */
          if (text.type === "embeddedText") {
            return (
              <EmbeddedTextBlock
                chapterid={currentChapterId}
                text={text}
                index={index}
                key={key}
              />
            );
          }
          let diffWithText = "";
          if (text.diffWith) {
            const diffWith = text.versions.find(
              (version) => version.id === text.diffWith
            );
            if (diffWith) {
              diffWithText = diffWith.text;
            }
          }

          return (
            <div key={key}>
              {text.diffWith && (
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
              )}
              {!text.diffWith && (
                /*  <LazyLoad
                    //@ts-ignore
                    parentScroll={0}
                    screenHeight={1080}
                    key={text.id || index}
                  > */
                <TextEditor
                  chapterid={currentChapterId}
                  index={index}
                  settings={settings}
                  isInView={isInView}
                />
                /*  </LazyLoad> */
              )}
            </div>
          );
        })}
        {/* bottom padding */}
        <div className="h-24" />
      </div>
    </div>
  );
}
