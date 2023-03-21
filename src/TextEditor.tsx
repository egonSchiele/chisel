//@ts-nocheck
import React, { useState, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { TextField, Button, Box, Tooltip } from "@material-ui/core";
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
  const quillRef = useRef();

  const handleSynonymClick = (synonym) => {
    const quill = quillRef.current.getEditor();
    quill.deleteText(selectedWord.index, selectedWord.length);
    quill.insertText(selectedWord.index, synonym);
    setText(quill.getContents());
    setTooltipOpen(false);
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
    }
  };
  return (
    <Box>
      <TextField
        label="OpenAI API Key"
        variant="outlined"
        fullWidth
        value={apiKey}
        onChange={handleApiKeyChange}
      />
      <ClickAwayListener onClickAway={handleClickAway}>
        <div onClick={onClickEditor}>
          <ReactQuill ref={quillRef} value={text} onChange={handleTextChange} />
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
  );
};

export default TextEditor;
