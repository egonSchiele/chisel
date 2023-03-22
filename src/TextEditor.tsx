//@ts-nocheck
import { syllable } from "syllable";
import { fillers } from "fillers";

import React, { useState, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  TextField,
  Button,
  Box,
  Tooltip,
  Paper,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import openai from "./openai";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import { SwapHoriz } from "@material-ui/icons";
import axios from "axios";
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

type State = {
  text: string;
  synonyms: string[];
  tooltipPosition: { top: number; left: number };
  tooltipOpen: boolean;
  selectedWord: { index: number; length: number; contents: string };
  // selectedSyllables: number;
};
const initialState: State = {
  text: "Once upon a time,",
  synonyms: [],
  tooltipPosition: { top: 0, left: 0 },
  tooltipOpen: false,
  selectedWord: { index: 0, length: 0 },
};

const reducer = (state: State, action: any): State => {
  switch (action.type) {
    case "setText":
      return { ...state, text: action.payload };
    case "setSynonyms":
      return { ...state, synonyms: action.payload };
    case "clearSynonyms":
      return { ...state, synonyms: [] };
    case "setTooltipPosition":
      return { ...state, tooltipPosition: action.payload };
    case "openTooltip":
      return { ...state, tooltipOpen: true };
    case "closeTooltip":
      return { ...state, tooltipOpen: false };
    case "setSelectedWord":
      return { ...state, selectedWord: action.payload };
    case "synonymSelected":
      return { ...state, text: action.payload, tooltipOpen: false };
  }
};

const TextEditor = () => {
  const classes = useStyles();
  const [state, dispatch] = React.useReducer(reducer, initialState);
  /* const [text, setText] = useState("Once upon a time,");
  //const [apiKey, setApiKey] = useState("");
  const [synonyms, setSynonyms] = useState([]);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState({ index: 0, length: 0 });
  const [selectedSyllables, setSelectedSyllables] = useState(0);
 */
  const quillRef = useRef();

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

  const countSyllables = (text: string) => {
    try {
      return syllable(text);
    } catch (error) {
      console.error("Error counting syllables:", error);
      return 0;
    }
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
    console.log({ body });
    fetch("/api/expand", {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => {
      console.log({ res });
      res.json().then((data) => {
        const generatedText = data.choices[0].text;
        dispatch({ type: "setText", payload: `${text}${generatedText}` });
      });
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

  const onClickEditor = (event) => {
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection();
    console.log({ range });
    if (range && range.length > 0) {
      const word = quill.getText(range.index, range.length).trim();
      dispatch({
        type: "setSelectedWord",
        payload: { index: range.index, length: range.length, contents: word },
      });
    }
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

  const selectedSyllables = countSyllables(state.selectedWord.contents);

  return (
    <Box display="flex">
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
          <div onClick={onClickEditor}>
            <ReactQuill
              ref={quillRef}
              value={state.text}
              onChange={handleTextChange}
            />
          </div>
        </ClickAwayListener>
        <Tooltip
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
        </Tooltip>
        <Button variant="contained" color="primary" onClick={handleExpand}>
          Expand
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={highlightFillerWords}
        >
          Highlight Filler Words
        </Button>
      </Box>
      <Box>
        <Paper elevation={3}>
          <Box p={2}>
            <Typography variant="h6">Syllable Count</Typography>
            <Typography variant="h4">{selectedSyllables}</Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default TextEditor;
