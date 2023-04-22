import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import ButtonGroup from "./components/ButtonGroup";
import Button from "./components/Button";
import * as t from "./Types";
import * as fd from "./fetchData";
import List from "./components/List";
import Spinner from "./components/Spinner";
import { fetchSuggestionsWrapper } from "./utils";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store";
import { librarySlice } from "./reducers/librarySlice";

export default function PromptsSidebar({
  settings,
  closeSidebar,
  onLoad,
}: {
  settings: t.UserSettings;
  closeSidebar: () => void;
  onLoad: () => void;
}) {
  const state = useSelector((state: RootState) => state.library.editor);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const fetchSynonyms = async () => {
    const word = state._cachedSelectedText
      ? state._cachedSelectedText.contents
      : "";
    console.log("word", word);
    if (!word) return;
    setLoading(true);
    const res = await fetch(`https://api.datamuse.com/words?ml=${word}&max=20`);
    if (!res.ok) {
      setLoading(false);
      console.log("error w synonyms", res);
      return;
    }
    const response = await res.json();

    const synonyms = response.map((item) => item.word);
    console.log("synonyms", synonyms);
    dispatch(
      librarySlice.actions.addSuggestion({
        label: "Synonyms",
        value: synonyms.join(", "),
      }),
    );
    dispatch(librarySlice.actions.setSaved(false));
    setLoading(false);
    onLoad();
  };

  const prompts = settings.prompts.map((prompt, i) => (
    <li
      key={i}
      onClick={() => fetchSuggestionsWrapper(
        settings,
        setLoading,
        onLoad,
        prompt.text,
        prompt.label,
      )}
      className="py-xs text-black dark:text-slate-300 text-sm xl:text-md rounded-md cursor-pointer hover:bg-listitemhoverSecondary dark:hover:bg-dmlistitemhoverSecondary"
    >
      <p className="px-xs">{prompt.label}</p>
    </li>
  ));

  const buttonStyles = "hover:bg-sidebar bg-sidebarSecondary dark:bg-dmsidebarSecondary dark:hover:bg-dmsidebar";
  const rightMenuItem = {
    label: "Close",
    icon: <XMarkIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
    onClick: closeSidebar,
    className: buttonStyles,
  };

  const leftMenuItem = loading
    ? {
      label: "Loading",
      icon: <Spinner />,
      onClick: () => {},
      className: buttonStyles,
    }
    : null;

  const actions = [
    <li
      key="synonyms"
      onClick={fetchSynonyms}
      className="py-xs text-slate-300 text-sm xl:text-md rounded-md cursor-pointer hover:bg-listitemhoverSecondary dark:hover:bg-dmlistitemhoverSecondary"
    >
      <p className="px-xs">Get synonyms</p>
    </li>,
  ];

  return (
    <div className="h-full">
      <List
        title="Prompts"
        items={prompts}
        className="border-l border-r-0 h-auto"
        rightMenuItem={rightMenuItem}
        leftMenuItem={leftMenuItem}
      />
      {/*  <List
        title="Actions"
        items={actions}
        className="border-l border-r-0 h-auto"
        leftMenuItem={leftMenuItem}
      /> */}
    </div>
  );
}
