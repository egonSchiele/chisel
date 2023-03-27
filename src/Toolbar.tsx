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
  const handleSuggestion = async (_prompt, label) => {
    const max_tokens_with_min = Math.min(settings.max_tokens, 500);
    let text = state.text;
    if (state.selectedText && state.selectedText.length > 0) {
      text = state.selectedText.contents;
    }
    console.log({ text });
    let prompt = _prompt.replaceAll("{{text}}", text);
    const body = JSON.stringify({
      prompt,
      model: settings.model,
      max_tokens: max_tokens_with_min,
      num_suggestions: settings.num_suggestions,
    });
    setLoading(true);
    dispatch({ type: "clearError" });
    console.log({ body });
    fetch("/api/suggestions", {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        console.log({ res });
        /* if (!res.ok) {
          dispatch({ type: "setError", payload: res.statusText });

          setLoading(false);
          return;
        } */
        res.json().then((data) => {
          console.log({ data });
          if (data.error) {
            dispatch({ type: "setError", payload: data.error });

            setLoading(false);
            return;
          }

          if (!data.choices) {
            dispatch({ type: "setError", payload: "No choices returned." });

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
    <div className="grid grid-cols-8 w-full bg-button dark:bg-dmbutton">
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
      </ButtonGroup>
      {loading && <p>Loading...</p>}
    </div>
  );
}
