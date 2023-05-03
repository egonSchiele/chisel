import { fillers } from "fillers";

import React, { useState, useRef, useEffect } from "react";
import ReactQuill from "react-quill";
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

import { useTraceUpdate } from "./utils";
import { useParams } from "react-router-dom";
import { languages } from "./languages";

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

function Tag({ letter }) {
  return (
    <div className="m-0 p-0 mt-xs mr-xs text-center uppercase text-xs rounded border text-gray-500 border-gray-500">
      {letter}
    </div>
  );
}

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
}: {
  chapterid: string;
  index: number;
}) {
  const _pushTextToEditor = useSelector(
    (state: RootState) => state.library.editor._pushTextToEditor
  );

  const activeTextIndex = useSelector(
    (state: RootState) => state.library.editor.activeTextIndex
  );

  const isActive = activeTextIndex === index;
  const currentText = useSelector(getText(index));
  const currentChapterTextLength = useSelector(getSelectedChapterTextLength);

  const dispatch = useDispatch();
  const { open } = currentText;

  const quillRef = useRef();
  const inputDiv = useRef();

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

  const { textindex } = useParams();

  useEffect(() => {
    if (!inputDiv.current) return;
    // @ts-ignore
    console.log("textindex", textindex, index);
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
      setOpen(!open);
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
            dispatch(librarySlice.actions.setActiveTextIndex(index + 1));
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
            dispatch(librarySlice.actions.setActiveTextIndex(index - 1));
          }
        }
      }
    } else if (event.code === "Backspace") {
      if (quillRef && quillRef.current) {
        if (currentText && currentText.text.trim().length === 0) {
          // @ts-ignore
          const quill = quillRef.current.getEditor();
          const range = quill.getSelection();

          if (range.index === 0) {
            event.preventDefault();
            dispatch(librarySlice.actions.deleteBlock(index));
          }
        }
      }
    }
  };

  const handleKeyDownWhenClosed = (event) => {
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
  }, [handleKeyDownWhenClosed]);

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

  return (
    <div className="">
      {/* h-full"> */}
      <div className="ql-editor hidden">hi</div>
      <div className="ql-toolbar ql-snow hidden">hi</div>

      <div className="mb-sm h-full w-full" ref={inputDiv}>
        {open && (
          <div className="flex">
            <div className="flex-none ">
              <div
                className="h-5 cursor-pointer mr-xs"
                onClick={() => {
                  setOpen(false);
                }}
                data-selector={`close-${index}`}
              >
                <ChevronDownIcon
                  className={`w-5 h-5 ${
                    isActive ? "text-gray-300" : "text-gray-500"
                  }`}
                />
              </div>
              {currentText.reference && <Tag letter="R" />}
              {currentText.type === "code" && <Tag letter="C" />}
              {currentText.type === "markdown" && <Tag letter="M" />}
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
              className={`flex-grow border-l ${
                isActive ? "border-gray-300" : "border-gray-500"
              } pl-sm`}
              onClick={() => {
                dispatch(librarySlice.actions.clearCachedSelectedText());
              }}
              data-selector={`texteditor-${index}`}
            >
              {/*  {currentText.syntaxHighlighting && (
                <LanguageSelector chapterid={chapterid} index={index} />
              )} */}
              <ReactQuill
                ref={quillRef}
                placeholder=""
                className={`${currentText.type === "code" && "font-mono"}`}
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
            className={`flex ${
              index === activeTextIndex && "border border-gray-500"
            }`}
          >
            <div className="flex-none">
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
              {currentText.type === "code" && <Tag letter="C" />}
              {currentText.type === "markdown" && <Tag letter="M" />}
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
