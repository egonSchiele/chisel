//@ts-nocheck
import { syllable } from "syllable";

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

const TextEditor = () => {
  const classes = useStyles();
  const [text, setText] = useState("hi there darling");
  const [apiKey, setApiKey] = useState("");
  const [synonyms, setSynonyms] = useState([]);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState({ index: 0, length: 0 });
  const [selectedSyllables, setSelectedSyllables] = useState(0);

  const quillRef = useRef();

  const handleSynonymClick = (synonym) => {
    const quill = quillRef.current.getEditor();
    quill.deleteText(selectedWord.index, selectedWord.length);
    quill.insertText(selectedWord.index, synonym);
    setText(quill.getContents());
    setTooltipOpen(false);
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
    setTooltipOpen(false);
  };

  const handleTextChange = (value) => {
    setText(value);
  };

  const handleApiKeyChange = (event) => {
    setApiKey(event.target.value);
  };

  const handleExpand = async () => {
    const body = JSON.stringify({
      prompt: `${text}. Write another paragraph:`,
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
        setText(`${text}${generatedText}`);
      });
    });
  };

  const fetchSynonyms = async (word) => {
    try {
      const response = await axios.get(
        `https://api.datamuse.com/words?ml=${word}&max=10`
      );
      console.log("fetchSynonyms");
      console.log({ response });
      setSynonyms(response.data.map((item) => item.word));
    } catch (error) {
      console.error("Error fetching synonyms:", error);
      setSynonyms([]);
    }
  };

  const onClickEditor = (event) => {
    console.log("click");
    if (event.metaKey || event.ctrlKey) {
      console.log("metaKey");
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      console.log({ range });
      if (range && range.length > 0) {
        const word = quill.getText(range.index, range.length).trim();
        fetchSynonyms(word);
        setSelectedWord({ index: range.index, length: range.length });
        const bounds = quill.getBounds(range.index);
        setTooltipPosition({ top: bounds.top, left: bounds.left });
        setTooltipOpen(true);
      }
    } else {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      if (range && range.length > 0) {
        const text = quill.getText(range.index, range.length); //.trim();
        setSelectedSyllables(countSyllables(text));
      } else {
        setSelectedSyllables(0);
      }
    }
  };
  return (
    <Box display="flex">
      <Box flexGrow={1}>
        <TextField
          label="OpenAI API Key"
          variant="outlined"
          fullWidth
          value={apiKey}
          onChange={handleApiKeyChange}
        />
        <ClickAwayListener onClickAway={handleClickAway}>
          <div onClick={onClickEditor}>
            <ReactQuill
              ref={quillRef}
              value={text}
              onChange={handleTextChange}
            />
          </div>
        </ClickAwayListener>
        <Tooltip
          open={tooltipOpen}
          title={synonyms.map((synonym, index) => (
            <div
              key={index}
              className={classes.tooltip}
              onClick={() => handleSynonymClick(synonym)}
            >
              {synonym}
              {index !== synonyms.length - 1 && <SwapHoriz />}
            </div>
          ))}
          PopperProps={{
            style: {
              top: tooltipPosition.top,
              left: tooltipPosition.left,
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
