import PromptsSidebar from "./PromptsSidebar";
import React, { useState, useRef, useReducer, useEffect } from "react";
import "./globals.css";
import TextEditor from "./TextEditor";
import Sidebar from "./Sidebar";
import { EditorState, State } from "./Types";
import * as t from "./Types";
import { useInterval, useLocalStorage } from "./utils";
import {
  CheckCircleIcon,
  ChevronRightIcon,
  EllipsisHorizontalCircleIcon,
  MinusIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { NavButton } from "./NavButton";

export default function Editor({
  state,
  dispatch,
  onSave,
}: {
  state: t.State;
  dispatch: React.Dispatch<t.ReducerAction>;
  onSave: (state: t.State) => void;
}) {
  async function saveChapter(state: t.State) {
    if (state.saved) return;
    if (!state.chapter) {
      console.log("no chapter");
      return;
    }

    const chapter = { ...state.chapter };
    chapter.suggestions = state.suggestions;
    const body = JSON.stringify({ chapter });

    const result = await fetch("/api/saveChapter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    if (!result.ok) {
      dispatch({ type: "SET_ERROR", payload: result.statusText });
      return;
    } else {
      dispatch({ type: "CLEAR_ERROR" });
      dispatch({ type: "SET_SAVED", payload: true });
    }
  }

  let editorColSpan = "col-span-4";
  /* 
  if (sidebarOpen && promptsOpen) {
    editorColSpan = "col-span-2";
  } else if (sidebarOpen || promptsOpen) {
    editorColSpan = "col-span-3";
  } */

  return (
    <div className="flex w-full h-full">
      <div className={`w-full h-full ${editorColSpan}`}>
        <div className="h-18 xl:h-8 p-xs w-full xl:my-xs flex">
          <div className="flex flex-none"></div>
          <div className="flex flex-grow" />
        </div>
        <div className="h-full w-full">
          <TextEditor
            dispatch={dispatch as any}
            state={state}
            saved={state.saved}
            onSave={() => onSave(state)}
          />
        </div>
      </div>
    </div>
  );
}
