import PlainClipboard from "./PlainClipboard";
import { fillers } from "fillers";

import React, { useState, useRef, useEffect } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./globals.css";
import { useDispatch, useSelector } from "react-redux";
import Button from "./components/Button";
import ButtonGroup from "./components/ButtonGroup";
import { EditorState, State } from "./Types";
import Select from "./components/Select";
import Input from "./components/Input";
import ContentEditable from "./components/ContentEditable";
import * as t from "./Types";
import { RootState } from "./store";
import {
  getSelectedChapter,
  getSelectedChapterTextLength,
  getText,
  librarySlice,
} from "./reducers/librarySlice";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";

import { hasVersions, useTraceUpdate } from "./utils";
import { useParams } from "react-router-dom";
import { languages } from "./languages";
import BlockMenu from "./BlockMenu";
import CodeMenu from "./CodeMenu";
import Tag from "./components/Tag";
import VersionsMenu from "./VersionsMenu";

Quill.register("modules/clipboard", PlainClipboard, true);

const formats = [
  /*   "background",
  "bold",
  "color",
  "font",
  "code",
  "italic",
  "link",
  "size",
  "strike",
  "script",
  "underline",
  "blockquote",
  // "header",
  "indent",
  // "list", <-- commented-out to suppress auto bullets
  "align",
  "direction",
  "code-block",
  "formula",
  "image",
  "video", */
];

function LanguageSelector({ chapterid, index }) {
  const dispatch = useDispatch();
  const currentText: t.CodeBlock = useSelector(getText(index)) as t.CodeBlock;

  const { language } = currentText;
  return (
    <Select
      title=""
      name="language"
      value={language}
      className="w-fit dark:bg-gray-800 dark:border-gray-500 dark:text-gray-300 "
      onChange={(e) => {
        dispatch(
          librarySlice.actions.setLanguage({
            index,
            language: e.target.value,
          })
        );
      }}
    >
      {languages.map((lang) => (
        <option key={lang} value={lang}>
          {lang}
        </option>
      ))}
    </Select>
  );
}

function TextEditor({
  chapterid,
  index,
  settings,
}: {
  chapterid: string;
  index: number;
  settings: t.UserSettings;
}) {
  const _pushTextToEditor = useSelector(
    (state: RootState) => state.library.editor._pushTextToEditor
  );
  const _pushSelectionToEditor = useSelector(
    (state: RootState) => state.library.editor._pushSelectionToEditor
  );

  const activeTextIndex = useSelector(
    (state: RootState) => state.library.editor.activeTextIndex
  );

  const isActive = activeTextIndex === index;
  const currentText = useSelector(getText(index));
  const currentChapterTextLength = useSelector(getSelectedChapterTextLength);

  const dispatch = useDispatch();

  const quillRef = useRef();
  const inputDiv = useRef();
  const { textindex } = useParams();
  const highlight = textindex && textindex === index.toString();
  const open = currentText.open || highlight;

  const [edited, setEdited] = useState(false);

  useEffect(() => {
    if (!quillRef.current) return;
    // @ts-ignore
    const editor = quillRef.current.getEditor();
    // TODO
    editor.setText(currentText.text);
  }, [quillRef.current, chapterid, _pushTextToEditor]);

  useEffect(() => {
    if (isActive) {
      focus();
    }
  }, [activeTextIndex, open]);

  useEffect(() => {
    if (isActive && _pushSelectionToEditor && quillRef.current) {
      if (_pushSelectionToEditor.index === -1) {
        // @ts-ignore
        const editor = quillRef.current.getEditor();
        editor.setSelection(editor.getLength());
      }
      dispatch(librarySlice.actions.clearPushSelectionToEditor());
    }
  }, [activeTextIndex, _pushSelectionToEditor]);

  useEffect(() => {
    if (!inputDiv.current) return;
    if (textindex === index.toString()) {
      // @ts-ignore
      inputDiv.current.scrollIntoView();
    }
  }, [inputDiv, textindex]);

  const focus = () => {
    if (!quillRef.current) return;

    // @ts-ignore
    const editor = quillRef.current.getEditor();
    editor.focus();
  };
  const handleTextChange = (value) => {
    if (!quillRef.current) return;
    if (!edited) return;
    // @ts-ignore
    const editor = quillRef.current.getEditor();
    dispatch(librarySlice.actions.setSaved(false));
    // dispatch(librarySlice.actions.setContents(editor.getContents()));
    dispatch(librarySlice.actions.setText({ index, text: editor.getText() }));
  };

  const setSelection = (e) => {
    if (!quillRef.current) return;
    // @ts-ignore
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection();

    if (range) {
      const word = quill.getText(range.index, range.length).trim();
      dispatch(
        librarySlice.actions.setSelectedText({
          index: range.index,
          length: range.length,
          contents: word,
        })
      );
    } else {
      dispatch(librarySlice.actions.clearSelectedText());
    }
  };

  function setOpen(bool: boolean) {
    if (bool) {
      dispatch(librarySlice.actions.openBlock(index));
    } else {
      dispatch(librarySlice.actions.closeBlock(index));
    }
  }

  const handleKeyDown = (event) => {
    setEdited(true);

    if (event.altKey && event.shiftKey) {
      if (event.code === "ArrowDown" || event.code === "ArrowUp") {
        event.preventDefault();
        dispatch(librarySlice.actions.extractBlock());
      }
    } else if (event.shiftKey && event.code === "Tab") {
      event.preventDefault();
      setOpen(false);
    } else if (event.code === "ArrowDown") {
      if (quillRef && quillRef.current) {
        // @ts-ignore
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection();
        /*  console.log(
          range,
          currentText.text,
          currentText.text.trim().length,
          currentChapterTextLength
        ); */
        if (range) {
          if (
            range.length === 0 &&
            range.index >= currentText.text.trim().length &&
            index < currentChapterTextLength - 1
          ) {
            event.preventDefault();
            dispatch(librarySlice.actions.gotoNextOpenBlock());
          }
        }
      }
    } else if (event.code === "ArrowUp") {
      if (quillRef && quillRef.current) {
        // @ts-ignore
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection();

        if (range) {
          if (range.length === 0 && range.index === 0 && index > 0) {
            event.preventDefault();
            dispatch(librarySlice.actions.gotoPreviousOpenBlock());
          }
        }
      }
    } else if (event.code === "Backspace") {
      console.log(
        "backspace",
        quillRef,
        currentText,
        currentText.versions,
        currentText.text.trim().length
      );

      if (quillRef && quillRef.current) {
        // @ts-ignore
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection();

        console.log("backspace", range);
        if (range.index === 0) {
          if (
            currentText &&
            !hasVersions(currentText) &&
            currentText.text.trim().length === 0
          ) {
            event.preventDefault();
            dispatch(librarySlice.actions.deleteBlock(index));
            /* } else {
            dispatch(librarySlice.actions.mergeBlockUp(index)); */
          }
        }
      }
    }
  };

  /* const handleKeyDownWhenClosed = (event) => {
    if (open) return;
    if (!isActive) return;
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(true);
    } else if (event.code === "ArrowDown") {
      if (index < currentChapterTextLength - 1) {
        dispatch(librarySlice.actions.setActiveTextIndex(index + 1));
      }
    } else if (event.code === "ArrowUp") {
      if (index > 0) {
        dispatch(librarySlice.actions.setActiveTextIndex(index - 1));
      }
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDownWhenClosed);

    return () => {
      document.removeEventListener("keydown", handleKeyDownWhenClosed);
    };
  }, [handleKeyDownWhenClosed]); */

  let textPreview = "(no text)";
  if (currentText.text) {
    const line = currentText.text.split("\n")[0];
    const textLines = line.split(".");
    if (textLines.length > 1) {
      textPreview = `${textLines[0]}.`;
    } else {
      textPreview = line;
    }
  }

  let borderColor = "border-gray-500";
  if (isActive) borderColor = "border-gray-400";
  if (highlight) borderColor = "border-green-400";

  let textColor = "text-gray-300 dark:text-gray-500";
  if (isActive) textColor = "text-gray-500 dark:text-gray-400";

  let font = settings.design ? settings.design.font : "sans-serif";
  font = font || "sans-serif";
  let fontClass = font === "serif" ? "serif" : "sansSerif";
  if (currentText.type === "code") fontClass = "font-mono";
  return (
    <div className="">
      {/* h-full"> */}
      <div className="ql-editor hidden">hi</div>
      <div className="ql-toolbar ql-snow hidden">hi</div>

      <div className="mb-sm h-full w-full" ref={inputDiv}>
        {open && (
          <div className="flex">
            <div className={`flex-none text-sm mr-xs w-4 lg:w-16 ${textColor}`}>
              {currentText.caption}
            </div>

            <div className="flex-grow">
              <div
                className="h-5 cursor-pointer mr-xs"
                onClick={() => {
                  setOpen(false);
                }}
                data-selector={`close-${index}`}
              >
                <ChevronDownIcon
                  className={`w-5 h-5 ${
                    isActive ? "text-gray-400" : "text-gray-500"
                  }`}
                />
              </div>
              {<BlockMenu currentText={currentText} index={index} />}
              {hasVersions(currentText) && (
                <VersionsMenu currentText={currentText} index={index} />
              )}
              {currentText.type === "code" && (
                <CodeMenu currentText={currentText} index={index} />
              )}
              {currentText.reference && <Tag letter="R" />}
              {/* {currentText.type === "markdown" && <Tag letter="M" />}
              {currentText.type === "plain" && <Tag letter="P" />} */}
              {/* <div
                className="h-5 cursor-pointer mr-xs mt-xs"
                onClick={() => {
                  setOpen(false);
                }}
              >
                <Cog6ToothIcon
                  className={`w-5 h-5 ${
                    isActive ? "text-gray-300" : "text-gray-500"
                  }`}
                />
              </div> */}
            </div>

            <div
              className={`flex-grow border-l w-full pl-sm pr-md ${borderColor}`}
              onClick={() => {
                dispatch(librarySlice.actions.clearCachedSelectedText());
              }}
              data-selector={`texteditor-${index}`}
            >
              <ReactQuill
                ref={quillRef}
                placeholder=""
                className={`${fontClass}`}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                onChangeSelection={setSelection}
                onFocus={() =>
                  dispatch(librarySlice.actions.setActiveTextIndex(index))
                }
                scrolling-container="html"
                modules={{
                  history: {
                    userOnly: true,
                  },
                  toolbar: false,
                }}
                formats={formats}
              />
            </div>
          </div>
        )}
        {!open && (
          <div
            className={`flex  
              
            `}
          >
            <div
              className={` text-sm mr-xs flex-none w-4 lg:w-16 ${textColor}`}
            >
              {currentText.caption}
            </div>
            <div className="flex">
              <div
                className="flex-none cursor-pointer mr-xs"
                onClick={() => {
                  setOpen(true);
                }}
                data-selector={`open-${index}`}
              >
                <ChevronRightIcon className="w-5 h-5 text-gray-500" />
              </div>

              {currentText.reference && <Tag letter="R" />}
              {/*   {currentText.type === "code" && (
                <CodeMenu currentText={currentText} index={index} />
              )} */}
            </div>
            <div className="flex-grow border-l border-gray-500 pl-sm">
              <p
                className="text-gray-500"
                data-selector={`text-preview-${index}`}
              >
                {textPreview}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TextEditor;
