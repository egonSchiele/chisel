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
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import { useTraceUpdate } from "./utils";

function TextEditor({
  chapterid,
  index,
  onSave,
}: {
  chapterid: string;
  index: number;
  onSave: () => void;
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

      <div className="mb-sm h-full w-full">
        {open && (
          <div className="flex">
            <div
              className="flex-none cursor-pointer mr-xs"
              onClick={() => {
                setOpen(false);
              }}
            >
              <ChevronDownIcon
                className={`w-5 h-5 ${
                  isActive ? "text-gray-300" : "text-gray-500"
                }`}
              />
            </div>
            <div
              className={`flex-grow border-l ${
                isActive ? "border-gray-300" : "border-gray-500"
              } pl-sm`}
              onClick={() => {
                dispatch(librarySlice.actions.clearCachedSelectedText());
              }}
            >
              <ReactQuill
                ref={quillRef}
                placeholder=""
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                onChangeSelection={setSelection}
                onFocus={() =>
                  dispatch(librarySlice.actions.setActiveTextIndex(index))
                }
                modules={{
                  history: {
                    userOnly: true,
                  },
                }}
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
            <div
              className="flex-none cursor-pointer mr-xs"
              onClick={() => {
                setOpen(true);
              }}
            >
              <ChevronRightIcon className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex-grow border-l border-gray-500 pl-sm">
              <p className="text-gray-500">{textPreview}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TextEditor;
