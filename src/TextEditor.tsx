import highlightErrors from "./focusModeChecks";
import { hedges } from "hedges";
import { normalize, findSubarray, split } from "./utils";
import { fillers } from "fillers";
import PlainClipboard from "./components/PlainClipboard";

import {
  ChevronDownIcon,
  ChevronRightIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect, useRef, useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useDispatch, useSelector } from "react-redux";
import * as t from "./Types";
import Select from "./components/Select";
import "./globals.css";
import {
  getSelectedChapterTextLength,
  getText,
  librarySlice,
} from "./reducers/librarySlice";
import { RootState } from "./store";

import { useParams } from "react-router-dom";
import CodeMenu from "./CodeMenu";
import BlockMenu from "./components/BlockMenu";
import Tag from "./components/Tag";
import VersionsMenu from "./components/VersionsMenu";
import { languages } from "./lib/languages";
import { hasVersions } from "./utils";

let Inline = Quill.import("blots/inline");

class SpanClass extends Inline {
  static create(value) {
    let node = super.create();

    if (value) {
      node.setAttribute("class", `inline ${value}`);
      node.setAttribute("title", value);
    }
    return node;
  }
}

SpanClass.blotName = "class";
SpanClass.tagName = "div";
Quill.register(SpanClass);

Quill.register("modules/clipboard", PlainClipboard, true);

const formats = [
  "background",
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
  //"indent",
  // "list", <-- commented-out to suppress auto bullets
  "align",
  "direction",
  "code-block",
  "formula",
  "image",
  "video",
  "class",
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
  isInView = true,
}: {
  chapterid: string;
  index: number;
  settings: t.UserSettings;
  isInView?: boolean;
}) {
  const _pushTextToEditor = useSelector(
    (state: RootState) => state.library.editor._pushTextToEditor
  );
  const _pushSelectionToEditor = useSelector(
    (state: RootState) => state.library.editor._pushSelectionToEditor
  );
  const _triggerFocusModeRerender = useSelector(
    (state: RootState) => state.library.editor._triggerFocusModeRerender
  );

  const activeTextIndex = useSelector(
    (state: RootState) => state.library.editor.activeTextIndex
  );

  const viewMode: t.ViewMode = useSelector(
    (state: RootState) => state.library.viewMode
  );

  const isActive = activeTextIndex === index;
  const currentText = useSelector(getText(index));
  const currentChapterTextLength = useSelector(getSelectedChapterTextLength);

  const dispatch = useDispatch();

  const quillRef = useRef();
  const inputDiv = useRef<HTMLDivElement>();
  const { textindex } = useParams();
  const highlight = textindex && textindex === index.toString();
  const open = currentText.open; // || highlight;

  const [edited, setEdited] = useState(false);

  useEffect(() => {
    if (!quillRef.current) return;
    // @ts-ignore
    const editor = quillRef.current.getEditor();
    // TODO
    editor.setText(currentText.text.trim());
    highlightForFocusMode();
    formatMarkdown();
  }, [quillRef.current, chapterid, _pushTextToEditor]);

  useEffect(() => {
    if (viewMode === "focus") {
      if (isActive) {
        highlightForFocusMode();
      }
    } else {
      clearFocusModeHighlights();
    }
  }, [viewMode, _triggerFocusModeRerender]);

  /*   function updateIndicatorPosition() {
    console.log("updateIndicatorPosition");
    if (!inputDiv.current) return;
    console.log("scrolling");
    const scrollTop = inputDiv.current.scrollTop;
    const scrollHeight = inputDiv.current.scrollHeight;
    const clientHeight = inputDiv.current.clientHeight;
    const widthRatio = clientHeight / scrollHeight;
    const indicatorWidth = widthRatio * 100;
    console.log({ indicatorWidth }, "%");
  }

  useEffect(() => {
    console.log("useEffect", { isActive, open });
    if (isActive) {
      focus();
      console.log("focus", inputDiv);

      if (!inputDiv.current) return;
      const scrollTop = inputDiv.current.scrollTop;
      const scrollHeight = inputDiv.current.scrollHeight;
      const clientHeight = inputDiv.current.clientHeight;
      const widthRatio = clientHeight / scrollHeight;
      const indicatorWidth = widthRatio * 100;
      console.log({ indicatorWidth }, "%");
      // Attach the scroll event listener to update the indicator position
      inputDiv.current.addEventListener("scroll", updateIndicatorPosition);
      return () => {
        if (!inputDiv.current) return;
        inputDiv.current.removeEventListener("scroll", updateIndicatorPosition);
      };
    }
  }, [activeTextIndex, open, inputDiv.current]); */

  useEffect(() => {
    if (isActive) {
      focus();
    }
  }, [activeTextIndex, open]);

  function highlightForFocusMode() {
    if (viewMode !== "focus") return;
    // @ts-ignore
    if (!quillRef.current || !quillRef.current.getEditor) return;
    // @ts-ignore
    const quill = quillRef.current.getEditor();
    const text = quill.getText();
    console.log("highlightForFocusMode");
    quill.removeFormat(0, text.length - 1);
    quill.setText(text.trim());
    const formatData = highlightErrors(text);
    console.log("applying", formatData.length, "formats");
    formatData.forEach(({ range, format }) => {
      quill.formatText(range, format);
    });
    console.log("applied.");
    dispatch(
      librarySlice.actions.setFocusModeChecks(
        formatData.filter((d) => d.name !== "clear")
      )
    );
  }

  function formatMarkdown() {
    // @ts-ignore
    if (!quillRef.current || !quillRef.current.getEditor) return;
    // @ts-ignore
    const quill = quillRef.current.getEditor();
    const text = quill.getText();
    quill.removeFormat(0, text.length - 1);

    const lines = text.split("\n");
    let index = 0;
    lines.forEach((line, i) => {
      const lineLength = line.length;

      if (line.startsWith("# ")) {
        quill.formatText(index, 1, { class: "grayedout" });
        quill.formatText(index + 2, lineLength - 2, { class: "h1" });
      } else if (line.startsWith("## ")) {
        quill.formatText(index, 2, { class: "grayedout" });
        quill.formatText(index + 3, lineLength - 3, { class: "h2" });
      } else if (line.startsWith("### ")) {
        quill.formatText(index, 3, { class: "grayedout" });
        quill.formatText(index + 4, lineLength - 4, { class: "h3" });
      } else if (line.startsWith("#### ")) {
        quill.formatText(index, 4, { class: "grayedout" });
        quill.formatText(index + 5, lineLength - 5, { class: "h4" });
      }
      index += lineLength + 1;
    });
  }

  function clearFocusModeHighlights() {
    // @ts-ignore
    if (!quillRef.current || !quillRef.current.getEditor) return;
    // @ts-ignore
    const quill = quillRef.current.getEditor();
    const text = quill.getText();
    quill.formatText({ index: 0, length: text.length }, { class: null });
    dispatch(librarySlice.actions.setFocusModeChecks(null));
  }

  useEffect(() => {
    if (isActive && _pushSelectionToEditor && quillRef.current) {
      // @ts-ignore
      const editor = quillRef.current.getEditor();
      if (_pushSelectionToEditor.index === -1) {
        editor.setSelection(editor.getLength());
      } else {
        //editor.setSelection(_pushSelectionToEditor);
        highlightForFocusMode();
        editor.formatText(_pushSelectionToEditor, { class: "selectedText" });
      }
      dispatch(librarySlice.actions.clearPushSelectionToEditor());
    }
  }, [activeTextIndex, _pushSelectionToEditor]);

  useEffect(() => {
    if (!inputDiv.current) return;
    if (textindex === index.toString()) {
      // @ts-ignore
      inputDiv.current.scrollIntoViewIfNeeded(false);
      window.scrollTo(0, 0);
      dispatch(librarySlice.actions.setActiveTextIndex(parseInt(textindex)));
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

  function addQuotes(leftQuote, _rightQuote: null | undefined | string = null) {
    const rightQuote = _rightQuote || leftQuote;
    if (!quillRef.current) return;
    // @ts-ignore
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection();
    if (range) {
      quill.insertText(range.index, leftQuote, "user");
      quill.insertText(range.index + range.length + 1, rightQuote, "user");
      quill.setSelection(
        range.index - leftQuote.length + 1,
        range.length + leftQuote.length + rightQuote.length
      );
    }
  }

  function prepend(char: string) {
    if (!quillRef.current) return;
    // @ts-ignore
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection();
    if (range) {
      const text = quill.getText(range.index, range.length);
      const newText = text
        .split("\n")
        .map((line) => char + line)
        .join("\n");
      quill.deleteText(range.index, range.length, "user");
      quill.insertText(range.index, newText, "user");
      quill.setSelection(range.index, newText.length);
    }
  }

  function textIsSelected() {
    if (!quillRef.current) return;
    // @ts-ignore
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection();
    if (range) {
      return range.length > 0;
    }
    return false;
  }

  const handleKeyDown = (event) => {
    setEdited(true);
    console.log("handleKeyDown", event.shiftKey, event.code);
    // @ts-ignore
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection();
    if (range) {
      console.log("range", range);
    }

    if (event.shiftKey && event.code === "Quote" && textIsSelected()) {
      event.preventDefault();
      addQuotes('"');
    } else if (event.code === "Quote" && textIsSelected()) {
      event.preventDefault();
      addQuotes("'");
    } else if (
      event.shiftKey &&
      event.code === "Backquote" &&
      textIsSelected()
    ) {
      event.preventDefault();
      addQuotes("~");
    } else if (event.code === "Backquote" && textIsSelected()) {
      event.preventDefault();
      addQuotes("`");
    } else if (
      event.shiftKey &&
      (event.code === "BracketLeft" || event.code === "BracketRight") &&
      textIsSelected()
    ) {
      event.preventDefault();
      addQuotes("{", "}");
    } else if (
      (event.code === "BracketLeft" || event.code === "BracketRight") &&
      textIsSelected()
    ) {
      event.preventDefault();
      addQuotes("[", "]");
    } else if (
      ((event.shiftKey && event.code === "Digit9") ||
        event.code === "Digit0") &&
      textIsSelected()
    ) {
      event.preventDefault();
      addQuotes("(", ")");
    } else if (
      ((event.shiftKey && event.code === "Comma") || event.code === "Period") &&
      textIsSelected()
    ) {
      event.preventDefault();
      addQuotes("<", ">");
    } else if (event.shiftKey && event.code === "Digit8" && textIsSelected()) {
      event.preventDefault();
      addQuotes("*");
    } else if (event.code === "Minus" && textIsSelected()) {
      event.preventDefault();
      prepend("-");
    } else if (event.code === "Space" && textIsSelected()) {
      event.preventDefault();
      prepend(" ");
    } else if (event.code === "Tab" && textIsSelected()) {
      event.preventDefault();
      prepend("\t");
    } else if (
      event.code === "Enter" ||
      event.code === "ArrowDown" ||
      event.code === "ArrowUp" ||
      event.code === "ArrowLeft" ||
      event.code === "ArrowRight"
    ) {
      formatMarkdown();
    }

    if (event.altKey && event.shiftKey) {
      //    dispatch(librarySlice.actions.setText({ index, text: editor.getText() }));

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
            const div = document.getElementById("editDiv");
            if (div) {
              dispatch(librarySlice.actions.setScrollTo(div.scrollTop));
            }

            dispatch(librarySlice.actions.gotoPreviousOpenBlock());
          }
        }
      }
    } else if (event.code === "Backspace") {
      if (quillRef && quillRef.current) {
        // @ts-ignore
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection();

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
    } /* else {
      highlightForFocusMode();
    } */
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

  let borderColor = "border-gray-700";
  if (isActive) borderColor = "border-gray-500";
  //if (highlight) borderColor = "border-green-400";

  let textColor = "text-gray-300 dark:text-gray-500";
  if (isActive) textColor = "text-gray-500 dark:text-gray-400";

  let font = settings.design ? settings.design.font : "sans-serif";
  font = font || "sans-serif";
  let fontClass = font === "serif" ? "serif" : "sansSerif";
  if (currentText.type === "code") fontClass = "font-mono";
  if (!isInView) return null;
  return (
    <div className="">
      {/* h-full"> */}
      {/*       <div className="ql-editor hidden">hi</div>
      <div className="ql-toolbar ql-snow hidden">hi</div>
 */}
      <div className="mb-sm h-full w-full scroll-mt-lg" ref={inputDiv}>
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
              {currentText.hideInExport && (
                <EyeSlashIcon className="w-5 h-5 text-gray-500" />
              )}
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
              className={`flex-grow border-l w-full pl-sm pr-md  ${borderColor}`}
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
                onFocus={() => {
                  dispatch(librarySlice.actions.setActiveTextIndex(index));
                  if (viewMode === "focus") {
                    highlightForFocusMode();
                  }
                }}
                scrollingContainer="#editDiv"
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
            <div className="grid grid-cols-1">
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
              {currentText.hideInExport && (
                <EyeSlashIcon className="mt-xs w-5 h-5 text-gray-500" />
              )}
              {/*   {currentText.type === "code" && (
                <CodeMenu currentText={currentText} index={index} />
              )} */}
            </div>
            <div
              className={`flex-grow ${
                isActive ? "border" : "border-l"
              } border-gray-500 pl-sm`}
              onClick={() => {
                dispatch(librarySlice.actions.setActiveTextIndex(index));
              }}
            >
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
