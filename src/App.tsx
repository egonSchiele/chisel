import React, { useState, useRef, useReducer } from "react";
import produce from "immer";
import "./globals.css";
import TextEditor from "./TextEditor";
import Sidebar from "./Sidebar";
type EditorState = {
  text: string;
  tooltipPosition: { top: number; left: number };
  tooltipOpen: boolean;
  selectedWord: { index: number; length: number; contents: string };
  // selectedSyllables: number;
};

type State = {
  editor: EditorState;
  synonyms: string[];
};

const initialEditorState: EditorState = {
  text: "Once upon a time,",
  tooltipPosition: { top: 0, left: 0 },
  tooltipOpen: false,
  selectedWord: { index: 0, length: 0, contents: "" },
};

const initialState: State = {
  editor: initialEditorState,
  synonyms: [],
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
    case "setSelectedWord":
      state.editor.selectedWord = action.payload;
    case "synonymSelected":
      state.editor.text = action.payload;
      state.editor.tooltipOpen = false;
      break;
  }
  return state;
};

reducer = produce(reducer);

export default function App() {
  const [state, dispatch] = useReducer<(state: State, action: any) => State>(
    reducer,
    initialState
  );

  return (
    <div>
      <div>
        <Sidebar />
      </div>

      <div>
        <div className="flex flex-1 flex-col lg:pl-64">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h1 className="text-2xl font-semibold text-gray-900">
                Your story
              </h1>
            </div>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <TextEditor dispatch={dispatch} state={state.editor} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
