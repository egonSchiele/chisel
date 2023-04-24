import { fillers } from "fillers";

import React, { useState, useRef, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./globals.css";
import { useDispatch, useSelector } from "react-redux";
import ContentEditable from "./components/ContentEditable";
import { getSelectedChapter, librarySlice, saveFromTextEditorThunk } from "./reducers/librarySlice";
import { AppDispatch, RootState } from "./store";
import { useInterval } from "./utils";

function TextEditor({
  chapterid,
  index,
  saved,
}: {
  chapterid: string;
  index: number;
  saved: boolean;
}) {
  const state = useSelector((state: RootState) => state.library.editor);
  const currentChapter = useSelector(getSelectedChapter);
  const dispatch = useDispatch<AppDispatch>();

  useInterval(() => {
    const func = () => {
      dispatch(saveFromTextEditorThunk());
    };
    func();
  }, 5000);

  const quillRef = useRef();

  const [edited, setEdited] = useState(false);
  useEffect(() => {
    if (!quillRef.current) return;
    // @ts-ignore
    const editor = quillRef.current.getEditor();
    // TODO
    editor.setText(currentChapter.text[0].text);
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

  const handleTextChange = (value) => {
    if (!quillRef.current) return;
    if (!edited) return;
    // @ts-ignore
    const editor = quillRef.current.getEditor();
    if (saved) {
      dispatch(librarySlice.actions.setSaved(false));
    }
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
      dispatch(saveFromTextEditorThunk());
    }
  };

  return (
    <div className="h-full">
      <div className="mx-auto max-w-7xl px-sm lg:px-md mb-sm h-full">
        <div className="ql-editor hidden">hi</div>
        <div className="ql-toolbar ql-snow hidden">hi</div>
        <ContentEditable
          value={currentChapter.title}
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
