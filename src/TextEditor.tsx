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
  console.log("TextEditor", index);
  const _pushTextToEditor = useSelector(
    (state: RootState) => state.library.editor._pushTextToEditor
  );
  const _pushContentToEditor = useSelector(
    (state: RootState) => state.library.editor._pushContentToEditor
  );
  /*   const currentChapter = useSelector(getSelectedChapter);
   */ const currentText = useSelector(getText(index));

  useTraceUpdate({
    chapterid,
    index,
    onSave,
    _pushTextToEditor,
    _pushContentToEditor,
    currentText,
  });

  const dispatch = useDispatch();
  const [open, setOpen] = useState(true);
  /*  return (
    <ContentEditable
      value={currentText.text}
      className="text-2xl mb-sm tracking-wide font-semibold text-darkest dark:text-lightest"
      onSubmit={() => {}}
      selector="text-editor-title"
    />
  ); */

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
    if (!quillRef.current) return;
    if (!_pushContentToEditor) {
      return;
    }
    // @ts-ignore
    const editor = quillRef.current.getEditor();
    editor.insertText(-1, _pushContentToEditor);
  }, [quillRef.current, chapterid, _pushContentToEditor]);

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
    //dispatch(librarySlice.actions.setSaved(false));
    // dispatch(librarySlice.actions.setContents(editor.getContents()));
    //dispatch(librarySlice.actions.setText({ index, text: editor.getText() }));
  };

  const setSelection = (e) => {
    console.log("setSelection", e);
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
      console.log("no range");
      dispatch(librarySlice.actions.clearSelectedText());
    }
  };

  const handleKeyDown = (event) => {
    setEdited(true);
    if (event.metaKey && event.code === "KeyS") {
      event.preventDefault();
      console.log("saving!");
      onSave();
    } else if (
      event.altKey &&
      event.shiftKey &&
      event.code === "ArrowDown"
      /* state.selectedText.length > 0 */
    ) {
      event.preventDefault();
      dispatch(librarySlice.actions.extractBlock());
    }
  };

  return (
    <div className="">
      {/* h-full"> */}
      <div className="ql-editor hidden">hi</div>
      <div className="ql-toolbar ql-snow hidden">hi</div>

      <div className="mb-sm h-full w-full">
        {/* {open && ( */}
        <div className="flex">
          <div
            className="flex-none cursor-pointer mr-xs"
            onClick={() => {
              dispatch(librarySlice.actions.closeBlock(index));
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
              /* onFocus={() =>
                dispatch(librarySlice.actions.setActiveTextIndex(index))
              } */
            />
          </div>
        </div>
        {/* )} */}
        {/*    {!open && (
          <div className="flex">
            <div
              className="flex-none cursor-pointer mr-xs"
              onClick={() => {
                dispatch(librarySlice.actions.openBlock(index));
                setOpen(true);
              }}
            >
              <ChevronRightIcon className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex-grow border-l border-gray-500 pl-sm">
              <p className="text-gray-500">
                {currentChapter.text[index].text.split("\n")[0]}
              </p>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}

export default TextEditor;
