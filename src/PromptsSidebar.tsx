import React, { useState } from "react";
import ButtonGroup from "./components/ButtonGroup";
import Button from "./components/Button";
import * as t from "./Types";
import List from "./components/List";
import { XMarkIcon } from "@heroicons/react/24/outline";


function Spinner() {
  return (
    <div role="status">
      <svg
        aria-hidden="true"
        className="w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-slate-300"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

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

  const fetchSynonyms = async () => {
    const word = state.cachedSelectedTextContents;
    console.log("word", word);
    if (!word) return;
      setLoading(true);
      const res = await fetch(
        `https://api.datamuse.com/words?ml=${word}&max=20`
      );
      if (!res.ok) {
        setLoading(false);
        console.log("error w synonyms", res);        
        return;
      }
      const response = await res.json();
      
      const synonyms = response.map((item) => item.word);
      console.log("synonyms", synonyms);
      dispatch({
        type: "addSuggestion",
        label: "Synonyms",
        payload: synonyms.join(", "),
      });

    dispatch({ type: "setSaved", payload: false });
      setLoading(false);    
      onLoad();
  };

  const prompts = settings.prompts.map((prompt, i) => {
    return (
      <li
        key={i}        
        onClick={() => handleSuggestion(prompt.text, prompt.label)}        
        className="py-xs text-slate-300 text-sm xl:text-md rounded-md cursor-pointer hover:bg-listitemhoverSecondary dark:hover:bg-dmlistitemhoverSecondary"
      >
        <p className="px-xs">{prompt.label}</p>        
      </li>
    );
  });

  const buttonStyles = "bg-dmsidebarSecondary dark:hover:bg-dmsidebar";
  const rightMenuItem =
    { label: "Close", icon: <XMarkIcon className="w-4 h-4" />, onClick: closeSidebar, className: buttonStyles }
  
    const leftMenuItem = loading ?
    { label: "Loading", icon: <Spinner />, onClick: () => {}, className: buttonStyles } : null
  
const actions = [
  <li  
  key="synonyms"
  onClick={fetchSynonyms}
  className="py-xs text-slate-300 text-sm xl:text-md rounded-md cursor-pointer hover:bg-listitemhoverSecondary dark:hover:bg-dmlistitemhoverSecondary"
>
  <p className="px-xs">Get synonyms</p>        
</li>]

  return (<div className="h-full">
    <List
      title="Prompts"
      items={prompts}
      className="border-l border-r-0 h-auto"
      rightMenuItem={
        rightMenuItem
      } 
      leftMenuItem={leftMenuItem}
    />
    <List
      title="Actions"
      items={actions}
      className="border-l border-r-0 h-auto"
      
      leftMenuItem={leftMenuItem}
    />
    </div>);
}
