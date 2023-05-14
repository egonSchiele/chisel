import React, { useCallback, useEffect, useRef } from "react";
import "./globals.css";
import { useDispatch, useSelector } from "react-redux";
import TextEditor from "./TextEditor";
import * as t from "./Types";
import {
  getChapterText,
  getCsrfToken,
  hasVersions,
  useTraceUpdate,
} from "./utils";
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
import { useKeyDown, useKeyboardScroll } from "./hooks";
import CodeBlock from "./components/CodeBlock";
import MarkdownBlock from "./components/MarkdownBlock";
import Select from "./components/Select";
import DiffViewer from "./DiffViewer";
import EmbeddedTextBlock from "./EmbeddedTextBlock";
import ReadOnlyView from "./ReadOnlyView";
export default function Editor({ settings }: { settings: t.UserSettings }) {
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

  const scrollTo = useSelector((state: RootState) => state.library.scrollTo);

  const viewMode = useSelector((state: RootState) => state.library.viewMode);

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
    return <div className="flex w-full h-full">Loading</div>;
  }

  if (viewMode === "readonly") {
    return (
      <div
        ref={readonlyDiv}
        className="flex h-screen overflow-auto w-full max-w-3xl mx-auto  "
        id="readonly"
      >
        <div className="mx-auto w-full px-sm  mb-sm h-full">
          <h1 className="text-2xl mb-sm tracking-wide font-semibold text-darkest dark:text-lightest">
            {currentChapterTitle}
          </h1>
          <div className="w-full">
            <ReadOnlyView
              textBlocks={currentText.filter((t) => t.open)}
              fontClass={fontClass}
            />
          </div>

          <div className="h-24" />
        </div>
      </div>
    );
  }

  return (
    <div
      id="editDiv"
      className="flex h-screen overflow-y-auto overflow-x-visible w-full max-w-5xl mx-auto"
      ref={editDiv}
    >
      <div className="mx-auto w-full max-w-4xl px-sm  mb-sm h-full">
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
          if (text.type === "embeddedText") {
            return (
              <EmbeddedTextBlock
                chapterid={currentChapterId}
                text={text}
                index={index}
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
            <>
              {hasVersions(text) && (
                <div className="text-sm flex items-center mb-sm ml-md">
                  <p className="mr-xs uppercase text-gray-400 dark:text-gray-400">
                    Diff against:
                  </p>
                  <Select
                    title=""
                    name="version"
                    className="max-w-24 flex-none !m-0"
                    value={text.diffWith}
                    onChange={(event) => {
                      dispatch(
                        librarySlice.actions.setDiffWith({
                          index,
                          diffWith: event.target.value,
                        })
                      );
                    }}
                  >
                    <option value="">None</option>
                    {text.versions.map((version) => (
                      <option key={version.id} value={version.id}>
                        {version.title} -{" "}
                        {new Date(version.createdAt).toLocaleString()}
                      </option>
                    ))}
                  </Select>
                  <Button
                    size="small"
                    rounded={true}
                    className="ml-sm h-min"
                    style="secondary"
                    onClick={() => {
                      dispatch(
                        librarySlice.actions.deleteAllVersions({
                          index,
                        })
                      );
                    }}
                  >
                    Delete other versions
                  </Button>
                </div>
              )}
              {text.diffWith && (
                <div className="flex overflow-auto w-full max-w-4xl mx-auto">
                  <DiffViewer
                    originalText={text.text}
                    newText={diffWithText}
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
                <TextEditor
                  chapterid={currentChapterId}
                  index={index}
                  key={text.id || index}
                  settings={settings}
                />
              )}
            </>
          );
        })}
        {/* bottom padding */}
        <div className="h-24" />
      </div>
    </div>
  );
}
