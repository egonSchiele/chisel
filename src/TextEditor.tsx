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
import { librarySlice } from "./reducers/librarySlice";

function TextEditor({
  chapterid,
  index,
  saved,
  onSave,
}: {
  chapterid: string;
  index: number;
  saved: boolean;
  onSave: () => void;
}) {
  const state = useSelector((state: RootState) => state.library.editor);
  const dispatch = useDispatch();

  const quillRef = useRef();

  const [edited, setEdited] = useState(false);
  useEffect(() => {
    if (!quillRef.current) return;
    // @ts-ignore
    const editor = quillRef.current.getEditor();
    editor.setText(state.text);
  }, [quillRef.current, chapterid, state._pushTextToEditor]);

  useEffect(() => {
    if (!quillRef.current) return;
    if (!state._pushContentToEditor) {
      return;
    }
    // @ts-ignore
    const editor = quillRef.current.getEditor();
    editor.insertText(-1, state._pushContentToEditor);
  }, [quillRef.current, chapterid, state._pushContentToEditor]);

  const focus = () => {
    if (!quillRef.current) return;
    // @ts-ignore
    const editor = quillRef.current.getEditor();
    editor.focus();
  };

  /*   const highlightFillerWords = () => {
    if (!quillRef.current) return;
    const quill = quillRef.current.getEditor();
    const text = quill.getText();

    const words = text.split(" ");

    let idx = 0;
    words.forEach((word) => {
      word = word.toLowerCase();
      word = word.trim();
      const start = idx;
      const end = idx + word.length;
      const isFiller = fillers.includes(word);
      console.log({ word, start, end, isFiller });

      if (isFiller) {
        quill.formatText(start, word.length, {
          background: "yellow",
        });
      } else {
        quill.formatText(start, word.length, {
          background: "white",
        });
      }
      idx = end + 1;
    });
  };
 */
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
        }),
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
    }
  };

  return (
    <div className="h-full">
      <div className="mx-auto max-w-7xl px-sm lg:px-md mb-sm h-full">
        <div className="ql-editor hidden">hi</div>
        <div className="ql-toolbar ql-snow hidden">hi</div>
        <ContentEditable
          value={state.title}
          className="text-2xl mb-sm tracking-wide font-semibold text-darkest dark:text-lightest"
          onSubmit={(title) => {
            dispatch(librarySlice.actions.setTitle(title));
          }}
          nextFocus={focus}
          selector="text-editor-title"
        />
        <div className="mb-md h-full w-full">
          <ReactQuill
            ref={quillRef}
            placeholder="Write something..."
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onChangeSelection={setSelection}
          />
        </div>
      </div>
    </div>
  );
}

export default TextEditor;
