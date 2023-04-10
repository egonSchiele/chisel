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
  bookid,
  state,
  dispatch,
  bookListOpen,
  chapterListOpen,
  openBookList,
  closeBookList,
}: {
  bookid: string;
  state: t.State;
  dispatch: React.Dispatch<t.ReducerAction>;
  bookListOpen: boolean;
  chapterListOpen: boolean;
  openBookList: () => void;
  closeBookList: () => void;
}) {
  const [triggerHistoryRerender, setTriggerHistoryRerender] = useState(0);

  /*   useEffect(() => {
    dispatch({ type: "SET_ALL_NEW_STATE", payload: initialState(chapter) });
  }, [chapter]); */

  async function onTextEditorSave(state: t.State) {
    await saveChapter(state);
    await saveToHistory(state);
    setTriggerHistoryRerender((t) => t + 1);
  }

  async function saveToHistory(state: t.State) {
    const body = JSON.stringify({
      chapterid: state.chapter.chapterid,
      text: state.chapter.text,
    });

    console.log(state.chapter.text, "!!");

    const result = await fetch("/api/saveToHistory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body,
    });
  }

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

  const addToContents = (text: string) => {
    dispatch({
      type: "ADD_TO_CONTENTS",
      payload: text,
    });
  };

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
          <div className="flex flex-none">
            <div className="flex-none">
              {!bookListOpen && (
                <button
                  type="button"
                  className="relative rounded-md inline-flex items-center bg-white dark:hover:bg-dmsidebar dark:bg-dmsidebarSecondary pl-0 pr-3 py-2 text-gray-400  hover:bg-gray-50 ring-0"
                  onClick={openBookList}
                >
                  <span className="sr-only">Close</span>
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-grow" />
          <div className="flex flex-none">
            {/*    {!state.saved && (
              <NavButton label="Unsaved" onClick={() => {}}>
                <MinusIcon className="h-5 w-5" aria-hidden="true" />
              </NavButton>
            )}

            {state.saved && (
              <NavButton label="Unsaved" onClick={() => {}}>
                <CheckCircleIcon
                  className="h-5 w-5 text-green-700 dark:text-green-300"
                  aria-hidden="true"
                />
              </NavButton>
            )} */}

            {/*    <NavButton
              label="Prompts"
              onClick={() => {
                setPromptsOpen((current) => !current);
                if (!promptsOpen) {
                  closeBookList();
                }
              }}
            >
              <SparklesIcon className="h-5 w-5" aria-hidden="true" />
            </NavButton>

            <NavButton
              label="Sidebar"
              onClick={() => {
                setSidebarOpen((s) => !s);
                if (!sidebarOpen) {
                  closeBookList();
                }
              }}
            >
              <EllipsisHorizontalCircleIcon
                className="h-5 w-5"
                aria-hidden="true"
              />
            </NavButton> */}
          </div>
        </div>
        <div className="h-full w-full">
          <TextEditor
            dispatch={dispatch as any}
            state={state}
            saved={state.saved}
            onSave={() => onTextEditorSave(state)}
          />
        </div>
      </div>
    </div>
  );
}
