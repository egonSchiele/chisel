import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { TextField, Button, Box } from "@material-ui/core";

const TextEditor = () => {
  const [text, setText] = useState("sample text");
  const [apiKey, setApiKey] = useState("");

  const handleTextChange = (value) => {
    setText(value);
  };

  const handleApiKeyChange = (event) => {
    setApiKey(event.target.value);
  };

  const handleExpand = async () => {
    fetch("/api/expand", {
      method: "POST",
      body: JSON.stringify({
        prompt: `${text}\n\nContinue the story:`,
      }),
    }).then((res) => {
      console.log({ res });
      res.json().then((data) => {
        const generatedText = data.choices[0].text;
        setText(`${text}${generatedText}`);
      });
    });
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
      <ReactQuill value={text} onChange={handleTextChange} />
      {/* Add "Expand" button here */}
      <Button variant="contained" color="primary" onClick={handleExpand}>
        Expand
      </Button>
    </Box>
  );
};

export default TextEditor;
