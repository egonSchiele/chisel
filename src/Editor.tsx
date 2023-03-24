import { syllable } from "syllable";
import React, { useState, useRef, useReducer, useEffect } from "react";
import produce from "immer";
import "./globals.css";
import TextEditor from "./TextEditor";
import Sidebar from "./Sidebar";
import InfoPanel from "./InfoPanel";
import { EditorState, State } from "./Types";
import Panel from "./components/Panel";
import SuggestionPanel from "./SuggestionPanel";
import { useParams } from "react-router-dom";
import * as t from "./Types";

const countSyllables = (text: string) => {
  try {
    return syllable(text);
  } catch (error) {
    console.error("Error counting syllables:", error);
    return 0;
  }
};

export default function Editor({
  book,
  setTitle,
  setText,
}: {
  book: t.Book;
  setTitle: (chapterID: string, newTitle: string) => void;
  setText: (chapterID: string, newText: string) => void;
}) {
  const { chapterid } = useParams();

  let chapter: t.Chapter | null = null;

  book.chapters.forEach((c) => {
    if (c.chapterid === chapterid) {
      chapter = c;
    }
  });

  const initialEditorState: EditorState = {
    text: chapter ? chapter.text : "",
    contents: {},
    tooltipPosition: { top: 0, left: 0 },
    tooltipOpen: false,
    selectedText: { index: 0, length: 0, contents: "" },
  };

  const initialState: State = {
    editor: initialEditorState,
    synonyms: [],
    infoPanel: { syllables: 0 },
    suggestions: [
      {
        type: "expand",
        contents:
          "In a faraway kingdom, there lived a vibrant young princess who was beloved by her people. Despite her royal wealth, not to mention her long flowing hair, the young princess felt trapped in the castle walls. She was desperate to explore the      ",
      },
    ],
  };

  let reducer = (state: State, action: any): State => {
    switch (action.type) {
      case "setText":
        state.editor.text = action.payload;
        setText(chapterid, state.editor.text);
        break;
      case "setContents":
        state.editor.contents = action.payload;
        break;
      case "addToContents":
        state.editor.contents.insert(action.payload);
        state.editor.text += action.payload;
        setText(chapterid, state.editor.text);
        break;
      case "setSynonyms":
        state.synonyms = action.payload;
        break;
      case "clearSynonyms":
        state.synonyms = [];
        break;
      case "setTooltipPosition":
        state.editor.tooltipPosition = action.payload;
        break;
      case "openTooltip":
        state.editor.tooltipOpen = true;
        break;
      case "closeTooltip":
        state.editor.tooltipOpen = false;
        break;
      case "setSelectedText":
        state.editor.selectedText = action.payload;
      case "synonymSelected":
        state.editor.selectedText = action.payload;
        state.editor.tooltipOpen = false;
        break;
      case "addExpandSuggestion":
        state.suggestions.push({
          type: "expand",
          contents: action.payload,
        });
        break;

      case "addContractSuggestion":
        state.suggestions.push({
          type: "contract",
          contents: action.payload,
        });
        break;

      case "addRewriteSuggestion":
        state.suggestions.push({
          type: "rewrite",
          contents: action.payload,
        });
        break;
    }
    return state;
  };

  reducer = produce(reducer);

  const [state, dispatch] = useReducer<(state: State, action: any) => State>(
    reducer,
    initialState
  );

  let selectedSyllables = countSyllables(state.editor.selectedText.contents);

  const infoPanelState = {
    ...state.infoPanel,
    syllables: selectedSyllables,
  };

  const addToContents = (text: string) => {
    console.log({ text });
    console.log(state.editor.contents);
    dispatch({
      type: "addToContents",
      payload: text,
    });
  };

  return (
    <div>
      <div>
        <Sidebar>
          <InfoPanel state={infoPanelState} />
          {state.suggestions.map((suggestion) => (
            <SuggestionPanel
              title={suggestion.type}
              contents={suggestion.contents}
              onClick={addToContents}
            />
          ))}
        </Sidebar>
      </div>

      <div>
        <div className="flex flex-1 flex-col lg:pl-64 my-lg">
          <div className="py-md">
            <div className="mx-auto max-w-7xl px-sm lg:px-md mb-sm">
              <h1 className="text-2xl font-semibold text-gray-900">
                Your story
              </h1>
            </div>
            <div className="mx-auto max-w-7xl px-sm lg:px-md">
              <TextEditor dispatch={dispatch as any} state={state.editor} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
