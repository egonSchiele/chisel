import React, { useState } from "react";
import ButtonGroup from "./components/ButtonGroup";
import Button from "./components/Button";
import * as t from "./Types";

export default function Toolbar({
  dispatch,
  state,
  settings,
}: {
  dispatch: (action: any) => t.State;
  state: t.EditorState;
  settings: t.UserSettings;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleSuggestion = async (_prompt, label) => {
    const max_tokens_with_min = Math.min(settings.max_tokens, 500);
    let prompt = _prompt.replaceAll("{{text}}", state.text);
    const body = JSON.stringify({
      prompt,
      model: settings.model,
      max_tokens: max_tokens_with_min,
    });
    setLoading(true);
    setError("");
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
        if (!res.ok) {
          setError(res.statusText);
          setLoading(false);
          return;
        }
        res.json().then((data) => {
          console.log({ data });
          if (data.error) {
            setError(data.error.message);
            setLoading(false);
            return;
          }

          if (!data.choices) {
            setError("No choices returned.");
            setLoading(false);
            return;
          }

          data.choices.forEach((choice) => {
            const generatedText = choice.text;
            dispatch({
              type: "addSuggestion",
              label,
              payload: generatedText,
            });
          });
          dispatch({ type: "setSaved", payload: false });
          setLoading(false);
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="grid grid-cols-8 mb-sm w-full bg-black">
      {/*   <Select
          title="Engine"
          name="engine"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          <option>gpt-3.5-turbo</option>
          <option>text-davinci-003</option>
          <option>davinci</option>
          <option>curie</option>
        </Select>
        <Input
          title="Max Tokens"
          name="max_tokens"
          value={max_tokens}
          onChange={(e) => setMaxTokens(e.target.value)}
          className="ml-xs"
        /> */}
      <ButtonGroup className="col-span-6 mb-auto h-full">
        {settings.prompts.map((prompt, i) => {
          let classNames = "";
          if (i === 0) {
            classNames = "rounded-l border-r border-slate-800";
          } else if (i === settings.prompts.length - 1) {
            classNames = "rounded-r";
          } else {
            classNames = "border-r border-slate-800";
          }
          return (
            <Button
              key={i}
              disabled={loading}
              onClick={() => handleSuggestion(prompt.text, prompt.label)}
              size="small"
              className={classNames}
            >
              {prompt.label}
            </Button>
          );
        })}
        {/*
          <Button onClick={handleContract} className="ml-xs" size="small">
            Contract
          </Button>
          <Button onClick={handleRewrite} className="ml-xs" size="small">
            Rewrite
          </Button>
          <Button
            onClick={highlightFillerWords}
            className="ml-xs"
            size="small"
          >
            Highlight Filler Words
          </Button>
          <Button onClick={fixTextToSpeech} className="ml-xs" size="small">
            Fix Speech-To-Text
          </Button>
          <Button onClick={fixPassiveVoice} className="ml-xs" size="small">
            Rewrite As Active Voice
          </Button>
          {state.selectedText.length > 0 && (
            <Button
              onClick={handleSynonymClick}
              className="ml-xs"
              size="small"
            >
              Describe
            </Button>
          )}
          {state.selectedText.length > 0 && (
            <Button
              onClick={handleSynonymClick}
              className="ml-xs"
              size="small"
            >
              Synonyms
            </Button>
          )}{" "}
          */}
      </ButtonGroup>
    </div>
  );
}
