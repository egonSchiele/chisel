import { syllable } from "syllable";
import React, { useState, useRef, useReducer, useEffect } from "react";
import produce from "immer";
import "./globals.css";
import TextEditor from "./TextEditor";
import Sidebar from "./Sidebar";
import InfoPanel from "./InfoPanel";
import { EditorState, State } from "./Types";

const initialEditorState: EditorState = {
  text: "Once upon a time,",
  tooltipPosition: { top: 0, left: 0 },
  tooltipOpen: false,
  selectedText: { index: 0, length: 0, contents: "" },
};

const initialState: State = {
  editor: initialEditorState,
  synonyms: [],
  infoPanel: { syllables: 0 },
};

let reducer = (state: State, action: any): State => {
  switch (action.type) {
    case "setText":
      state.editor.text = action.payload;
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
  }
  return state;
};

reducer = produce(reducer);

const countSyllables = (text: string) => {
  try {
    return syllable(text);
  } catch (error) {
    console.error("Error counting syllables:", error);
    return 0;
  }
};

export default function App() {
  const [state, dispatch] = useReducer<(state: State, action: any) => State>(
    reducer,
    initialState
  );

  let selectedSyllables = countSyllables(state.editor.selectedText.contents);

  const infoPanelState = {
    ...state.infoPanel,
    syllables: selectedSyllables,
  };

  return (
    <div>
      <div>
        <Sidebar>
          <InfoPanel state={infoPanelState} />
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
