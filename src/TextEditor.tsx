import { fillers } from "fillers";

import React, { useState, useRef, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./globals.css";
import Button from "./components/Button";
import ButtonGroup from "./components/ButtonGroup";
import { EditorState, State } from "./Types";
import Select from "./components/Select";
import Input from "./components/Input";
import ContentEditable from "./components/ContentEditable";
import * as t from "./Types";

function TextEditor({
  dispatch,
  state,
  chapterid,
  saved,
  onSave,
}: {
  dispatch: (action: any) => State;
  state: EditorState;
  chapterid: string;
  saved: boolean;
  onSave: () => void;
}) {
  console.log("TextEditor", chapterid);
  const quillRef = useRef();

  const [edited, setEdited] = useState(false);
  useEffect(() => {
    if (!quillRef.current) return;
    // @ts-ignore
    const editor = quillRef.current.getEditor();
    editor.setText(state.text);
    dispatch({ type: "SET_CONTENTS", payload: editor.getContents() });
  }, [quillRef.current, chapterid, state._pushTextToEditor]);

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
    dispatch({ type: "SET_SAVED", payload: false });
    dispatch({
      type: "SET_CONTENTS",
      payload: editor.getContents(),
    });
    dispatch({
      type: "SET_TEXT",
      payload: editor.getText(),
    });
  };

  const setSelection = (e) => {
    console.log("setSelection", e);
    if (!quillRef.current) return;
    // @ts-ignore
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection();

    if (range) {
      const word = quill.getText(range.index, range.length).trim();
      dispatch({
        type: "SET_SELECTED_TEXT",
        payload: { index: range.index, length: range.length, contents: word },
      });
    } else {
      console.log("no range");
      dispatch({ type: "CLEAR_SELECTED_TEXT" });
    }
  };
  /*   const onClickEditor = (event) => {
    setSelection(event);
    if (event.metaKey || event.ctrlKey) {
      if (range && range.length > 0) {
        fetchSynonyms(word);
        const bounds = quill.getBounds(range.index);
        dispatch({
          type: "SET_TOOLTIP_POSITION",
          payload: { top: bounds.top, left: bounds.left },
        });
        dispatch({ type: "OPEN_TOOLTIP" });
      }
    }
  }; */

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
            dispatch({ type: "SET_TITLE", payload: title });
          }}
          nextFocus={focus}
          selector="text-editor-title"
        />
        <div className="mb-md h-full w-full">
          <ReactQuill
            ref={quillRef}
            value={state.contents}
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
