//@ts-nocheck

import { fillers } from "fillers";

import React, { useState, useRef, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./globals.css";
import { Box, Paper, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import axios from "axios";
import Button from "./components/Button";
import ButtonGroup from "./components/ButtonGroup";
import { EditorState, State } from "./Types";
import Select from "./components/Select";
import Input from "./components/Input";
import ContentEditable from "./components/ContentEditable";
import * as t from "./Types";

const useStyles = makeStyles({
  generatedText: {
    animation: "$fadeIn 5s",
  },
  "@keyframes fadeIn": {
    "0%": { backgroundColor: "yellow" },
    "100%": { backgroundColor: "white" },
  },
  tooltip: {
    cursor: "pointer",
  },
});

const TextEditor = ({
  dispatch,
  state,
  settings,
  saved,
  onSave,
}: {
  dispatch: (action: any) => State;
  state: EditorState;
  settings: t.UserSettings;
  saved: boolean;
  onSave: () => void;
}) => {
  console.log("TextEditor", { state, settings, saved });
  const classes = useStyles();
  const quillRef = useRef();

  const [error, setError] = useState("");

  const [edited, setEdited] = useState(false);
  useEffect(() => {
    if (!quillRef.current) return;
    const editor = quillRef.current.getEditor();
    editor.setText(state.text);
    dispatch({ type: "setContents", payload: editor.getContents() });
    // document.body.addEventListener("click", focus);
    // return () => window.removeEventListener("click", focus);
  }, [quillRef.current, state.chapterid, state._pushTextToEditor]);

  const focus = () => {
    if (!quillRef.current) return;
    const editor = quillRef.current.getEditor();
    editor.focus();
  };

  const handleSynonymClick = (synonym) => {
    const quill = quillRef.current.getEditor();
    quill.deleteText(selectedWord.index, selectedWord.length);
    quill.insertText(selectedWord.index, synonym);
    dispatch({ type: "synonymSelected", payload: quill.getContents() });
  };

  const highlightFillerWords = () => {
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

  const handleClickAway = () => {
    dispatch({ type: "closeTooltip" });
  };

  const handleTextChange = (value) => {
    if (!quillRef.current) return;
    if (!edited) return;
    const editor = quillRef.current.getEditor();
    dispatch({ type: "setSaved", payload: false });
    dispatch({
      type: "setContents",
      payload: editor.getContents(),
    });
    dispatch({
      type: "setText",
      payload: editor.getText(),
    });
  };

  const fetchSynonyms = async (word) => {
    try {
      const response = await axios.get(
        `https://api.datamuse.com/words?ml=${word}&max=10`
      );
      const synonyms = response.data.map((item) => item.word);
      console.log("synonyms", synonyms);
      dispatch({ type: "setSynonyms", payload: synonyms });
    } catch (error) {
      console.error("Error fetching synonyms:", error);
      dispatch({ type: "clearSynonyms" });
    }
  };

  const setSelection = (e) => {
    console.log("setSelection", e);
    if (!quillRef.current) return;
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection();

    if (range) {
      const word = quill.getText(range.index, range.length).trim();
      dispatch({
        type: "setSelectedText",
        payload: { index: range.index, length: range.length, contents: word },
      });
    } else {
      console.log("no range");
      dispatch({ type: "clearSelectedText" });
    }
  };
  const onClickEditor = (event) => {
    setSelection();
    if (event.metaKey || event.ctrlKey) {
      if (range && range.length > 0) {
        fetchSynonyms(word);
        const bounds = quill.getBounds(range.index);
        dispatch({
          type: "setTooltipPosition",
          payload: { top: bounds.top, left: bounds.left },
        });
        dispatch({ type: "openTooltip" });
      }
    }
  };

  const handleKeyDown = (event) => {
    setEdited(true);
    if (event.metaKey && event.code == "KeyS") {
      event.preventDefault();
      console.log("saving!");
      onSave();
    }
  };

  return (
    <div className="h-full">
      {error !== "" && <p>Error: {error}</p>}
      <div className="ql-editor hidden">hi</div>
      <div className="ql-toolbar ql-snow hidden">hi</div>
      <div className="mx-auto max-w-7xl px-sm lg:px-md mb-sm h-full">
        <ContentEditable
          value={state.title}
          className="text-2xl mb-sm tracking-wide font-semibold text-darkest dark:text-lightest"
          onSubmit={(title) => {
            dispatch({ type: "setTitle", payload: title });
          }}
          nextFocus={focus}
        />
        {/* <ClickAwayListener onClickAway={handleClickAway}> */}
        <div onClick={onClickEditor} className="mb-md h-full w-full">
          <ReactQuill
            ref={quillRef}
            value={state.contents}
            placeholder="Write something..."
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onChangeSelection={setSelection}
          />
        </div>
        {/* </ClickAwayListener> */}
      </div>
      {/* <Tooltip
          open={state.tooltipOpen}
          title={state.synonyms.map((synonym, index) => (
            <div
              key={index}
              className={classes.tooltip}
              onClick={() => handleSynonymClick(synonym)}
            >
              {synonym}
              {index !== state.synonyms.length - 1 && <SwapHoriz />}
            </div>
          ))}
          PopperProps={{
            style: {
              top: state.tooltipPosition.top,
              left: state.tooltipPosition.left,
              zIndex: 9999,
            },
          }}
          interactive
        >
          <div />
        </Tooltip> */}
      {/*       <Box>
        <Paper elevation={3}>
          <Box p={2}>
            <Typography variant="h6">Syllable Count</Typography>
            <Typography variant="h4">{selectedSyllables}</Typography>
          </Box>
        </Paper>
      </Box>
 */}{" "}
    </div>
  );
};

export default TextEditor;
