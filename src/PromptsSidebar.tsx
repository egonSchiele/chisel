import React, { useContext, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from "react-redux";
import ButtonGroup from "./components/ButtonGroup";
import Button from "./components/Button";
import * as t from "./Types";
import * as fd from "./lib/fetchData";
import List from "./components/List";
import Spinner from "./components/Spinner";
import { fetchSuggestionsWrapper } from "./utils";
import { RootState } from "./store";
import {
  getSelectedBook,
  getSelectedChapter,
  getText,
  librarySlice,
} from "./reducers/librarySlice";
import LibraryContext from "./LibraryContext";
import ListItem from "./components/ListItem";

export default function PromptsSidebar({
  closeSidebar,
  onLoad,
}: {
  closeSidebar: () => void;
  onLoad: () => void;
}) {
  const state = useSelector((state: RootState) => state.library.editor);
  const currentBook = useSelector(getSelectedBook);
  const currentText = useSelector(getText(state.activeTextIndex));
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { settings } = useContext(LibraryContext) as t.LibraryContextType;
  const fetchSynonyms = async () => {
    const word = state._cachedSelectedText
      ? state._cachedSelectedText.contents
      : "";

    setLoading(true);
    const res = await fd.fetchSynonyms(word);
    setLoading(false);
    if (res.tag === "error") {
      dispatch(librarySlice.actions.setError(res.message));
      return;
    }
    dispatch(
      librarySlice.actions.addSuggestion({
        label: "Synonyms",
        value: res.payload.join(", "),
      })
    );
    dispatch(librarySlice.actions.setSaved(false));
    onLoad();
  };

  function getTextForSuggestions() {
    if (!currentText) return "";
    let { text } = currentText;
    if (
      state._cachedSelectedText &&
      state._cachedSelectedText.contents &&
      state._cachedSelectedText.contents.length > 0
    ) {
      text = state._cachedSelectedText.contents;
    }
    return text;
  }

  const prompts = settings.prompts.map((prompt, i) => (
    <li key={i}>
      <ListItem
        title={prompt.label}
        selected={false}
        plausibleEventName="prompt-click"
        onClick={() =>
          fetchSuggestionsWrapper(
            settings,
            setLoading,
            onLoad,
            prompt.text,
            prompt.label,
            getTextForSuggestions(),
            currentBook?.synopsis || "",
            dispatch
          )
        }
        selector={`prompt-${prompt.label}-button`}
        /*       className="py-xs text-black dark:text-slate-300 text-sm xl:text-md rounded-md cursor-pointer hover:bg-listitemhoverSecondary dark:hover:bg-dmlistitemhoverSecondary"
         */
      />
    </li>
  ));

  const buttonStyles =
    "hover:bg-sidebar bg-sidebarSecondary dark:bg-dmsidebarSecondary dark:hover:bg-dmsidebar";
  const rightMenuItem = null; /* {
    label: "Close",
    icon: <XMarkIcon className="w-6 h-6 xl:w-5 xl:h-5" />,
    onClick: closeSidebar,
    className: buttonStyles,
  }; */

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
    <List
      title="Prompts"
      items={prompts}
      className="border-r"
      rightMenuItem={rightMenuItem}
      leftMenuItem={leftMenuItem}
    />
  );
}
