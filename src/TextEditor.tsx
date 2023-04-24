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
  getText,
  librarySlice
} from "./reducers/librarySlice";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import { useTraceUpdate } from "./utils";

function TextEditor({
  chapterid,
  index,
  onSave
}: {
  chapterid: string;
  index: number;
  onSave: () => void;
}) {
  const _pushTextToEditor = useSelector(
    (state: RootState) => state.library.editor._pushTextToEditor
  );

  const currentText = useSelector(getText(index));

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
          contents: word
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
    if (event.metaKey && event.code === "KeyS") {
      event.preventDefault();

      onSave();
    } else if (event.altKey && event.shiftKey && event.code === "ArrowDown") {
      event.preventDefault();
      dispatch(librarySlice.actions.extractBlock());
    } else if (event.shiftKey && event.code === "Tab") {
      event.preventDefault();
      setOpen(!open);
    }
  };

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
              <ChevronDownIcon className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex-grow border-l border-gray-500 pl-sm">
              <ReactQuill
                ref={quillRef}
                placeholder="Write something..."
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                onChangeSelection={setSelection}
                onFocus={() =>
                  dispatch(librarySlice.actions.setActiveTextIndex(index))
                }
              />
            </div>
          </div>
        )}
        {!open && (
          <div className="flex">
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
