import React, { useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import { librarySlice } from "../reducers/librarySlice";
import { useDispatch } from "react-redux";
import { useColors } from "../lib/hooks";

export default function QuillTextArea({
  onChange,
  value,
  bookid,
  title = "",
  inputClassName = "",
  labelClassName = "",
}) {
  const dispatch = useDispatch();
  const quillRef = useRef();
  const colors = useColors();

  useEffect(() => {
    if (!quillRef.current) return;
    // @ts-ignore
    const editor = quillRef.current.getEditor();
    editor.setText(value);
  }, [quillRef.current, bookid]);

  const handleTextChange = (value) => {
    if (!quillRef.current) return;
    // @ts-ignore
    const editor = quillRef.current.getEditor();
    const text = editor.getText();
    onChange(text);
  };

  return (
    <div>
      {title && (
        <label
          className={`block text-sm font-light leading-6 ${colors.secondaryTextColor} uppercase ${labelClassName}`}
        >
          {title}
        </label>
      )}

      <ReactQuill
        ref={quillRef}
        placeholder=""
        className={inputClassName}
        onChange={handleTextChange}
        /*       onKeyDown={handleKeyDown}
         */ /*       scrollingContainer="#editDiv"
         */ modules={{
          history: {
            userOnly: true,
          },
          toolbar: false,
        }}
        formats={[]}
      />
    </div>
  );
}
