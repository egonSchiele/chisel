import React, { useState } from "react";
import ButtonGroup from "./components/ButtonGroup";
import Button from "./components/Button";
import * as t from "./Types";
import List from "./components/List";

export default function PromptsSidebar({
  dispatch,
  state,
  settings,
  closeSidebar,
  onLoad,
}: {
  dispatch: (action: any) => t.State;
  state: t.EditorState;
  settings: t.UserSettings;
  closeSidebar: () => void;
  onLoad: () => void;
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
          onLoad();
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const prompts = settings.prompts.map((prompt, i) => {
    return (
      <li
        key={i}
        /* disabled={loading} */
        onClick={() => handleSuggestion(prompt.text, prompt.label)}
        /* size="small" */
        className="py-xs text-slate-300 border-b border-listBorder dark:border-dmlistBorder cursor-pointer hover:bg-listitemhoverSecondary dark:hover:bg-dmlistitemhoverSecondary"
      >
        {prompt.label}
      </li>
    );
  });

  return (
    <List
      title="Prompts"
      items={prompts}
      className="border-l border-r-0 "
      close={closeSidebar}
      direction="right"
      loading={loading}
    />
  );
}
/*  
    <div className="grid grid-cols-8 w-full bg-button dark:bg-dmbutton">
      <ButtonGroup className="col-span-6 mb-auto h-full">
        {}
      </ButtonGroup>
      {loading && <p>Loading...</p>}
    </div>
  );
}
 */
