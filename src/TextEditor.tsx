//@ts-nocheck

import { fillers } from "fillers";

import React, { useState, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./globals.css";
import { Box, Paper, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import axios from "axios";
import Button from "./components/Button";
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

const TextEditor = ({ dispatch, state }) => {
  const classes = useStyles();
  const quillRef = useRef();
  const [loading, setLoading] = useState(false);

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
    dispatch({ type: "setText", payload: value });
  };

  /*   const handleApiKeyChange = (event) => {
    setApiKey(event.target.value);
  }; */

  const handleExpand = async () => {
    const body = JSON.stringify({
      prompt: `${state.text}. Write another paragraph:`,
    });
    setLoading(true);
    console.log({ body });
    fetch("/api/expand", {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        console.log({ res });
        res.json().then((data) => {
          const generatedText = data.choices[0].text;
          dispatch({
            type: "setText",
            payload: `${state.text}${generatedText}`,
          });
          setLoading(false);
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchSynonyms = async (word) => {
    try {
      const response = await axios.get(
        `https://api.datamuse.com/words?ml=${word}&max=10`
      );
      const synonyms = response.data.map((item) => item.word);
      dispatch({ type: "setSynonyms", payload: synonyms });
    } catch (error) {
      console.error("Error fetching synonyms:", error);
      dispatch({ type: "clearSynonyms" });
    }
  };

  const setSelection = () => {
    if (!quillRef.current) return;
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection();
    console.log({ range });
    if (range) {
      const word = quill.getText(range.index, range.length).trim();
      dispatch({
        type: "setSelectedWord",
        payload: { index: range.index, length: range.length, contents: word },
      });
    }
  };
  const onClickEditor = (event) => {
    setSelection();
    if (event.metaKey || event.ctrlKey) {
      console.log("metaKey");
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

  const handleKeyDown = (event) => {};

  return (
    <div className="">
      <Box flexGrow={1}>
        {/*         <TextField
          label="OpenAI API Key"
          variant="outlined"
          fullWidth
          value={apiKey}
          onChange={handleApiKeyChange}
        />
 */}{" "}
        <ClickAwayListener onClickAway={handleClickAway}>
          <div onClick={onClickEditor} className="mb-md">
            <ReactQuill
              ref={quillRef}
              value={state.text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              onChangeSelection={setSelection}
            />
          </div>
        </ClickAwayListener>
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
        <Button disabled={loading} onClick={handleExpand}>
          Expand
        </Button>
        <Button onClick={highlightFillerWords} className="ml-2">
          Highlight Filler Words
        </Button>
      </Box>
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
