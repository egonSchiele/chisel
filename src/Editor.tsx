import PromptsSidebar from "./PromptsSidebar";
import React, { useState, useRef, useReducer, useEffect } from "react";
import produce, { current } from "immer";
import "./globals.css";
import TextEditor from "./TextEditor";
import Sidebar from "./Sidebar";
import { EditorState, State } from "./Types";
import * as t from "./Types";
import { useInterval } from "./utils";
import {
  ChevronRightIcon,
  EllipsisHorizontalCircleIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const initialEditorState: EditorState = {
  title: "",
  text: "",
  contents: {},
  chapterid: "",
  tooltipPosition: { top: 0, left: 0 },
  tooltipOpen: false,
  selectedText: { index: 0, length: 0, contents: "" },
};

const reducer = produce((draft: t.State, action: any) => {
  switch (action.type) {
    case "setText":
      draft.editor.text = action.payload;
      draft.chapter.text = action.payload;
      draft.saved = false;
      break;
    case "setTitle":
      draft.editor.title = action.payload;
      draft.chapter.title = action.payload;
      draft.saved = false;
      break;
    case "setContents":
      draft.editor.contents = action.payload;
      break;
    case "setLoadedChapterData":
      draft.chapter = action.payload.chapter;
      draft.suggestions = action.payload.suggestions;
      draft.editor.text = action.payload.text;
      draft.editor.title = action.payload.title;
      draft.editor.chapterid = action.payload.chapterid;
      break;
    case "setSuggestions":
      if (action.payload) {
        draft.suggestions = action.payload;
        draft.saved = false;
      }
      break;
    case "setSaved":
      draft.saved = action.payload;
      break;
    case "setError":
      draft.error = action.payload;
      break;
    case "clearError":
      //draft.error = "";
      break;
    case "addToContents":
      if (!draft.editor.contents.insert) return;

      draft.editor.contents.insert(action.payload);
      draft.editor.text += action.payload;
      draft.saved = false;

      break;
    case "setSynonyms":
      draft.synonyms = action.payload;
      break;
    case "clearSynonyms":
      draft.synonyms = [];
      break;
    case "setTooltipPosition":
      draft.editor.tooltipPosition = action.payload;
      break;
    case "openTooltip":
      draft.editor.tooltipOpen = true;
      break;
    case "closeTooltip":
      draft.editor.tooltipOpen = false;
      break;
    case "setSelectedText":
      draft.editor.selectedText = action.payload;
      break;
    case "clearSelectedText":
      draft.editor.selectedText = { index: 0, length: 0, contents: "" };
      break;
    case "synonymSelected":
      draft.editor.selectedText = action.payload;
      draft.editor.tooltipOpen = false;
      break;
    case "addSuggestion":
      draft.suggestions.push({
        type: action.label,
        contents: action.payload,
      });
      draft.saved = false;
      break;
    case "deleteSuggestion":
      draft.suggestions.splice(action.payload, 1);
      draft.saved = false;
      break;
  }
});

export default function Editor({ chapterid, bookListOpen, openBookList, closeBookList }: { chapterid: string; bookListOpen: boolean; openBookList: () => void; closeBookList: () => void }) {
  console.log("chapterid", chapterid);
  const [loaded, setLoaded] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [promptsOpen, setPromptsOpen] = useState(false);
  const [triggerHistoryRerender, setTriggerHistoryRerender] = useState(0);
  const [settings, setSettings] = useState<t.UserSettings>({
    model: "",
    max_tokens: 0,
    num_suggestions: 0,
    theme: "default",
    version_control: false,
    prompts: [],
  });

  const initialState: State = {
    editor: initialEditorState,
    chapterid,
    chapter: null,
    synonyms: [],
    infoPanel: { syllables: 0 },
    suggestions: [
      {
        type: "expand",
        contents:
          "In a faraway kingdom, there lived a vibrant young princess who was beloved by her people. Despite her royal wealth, not to mention her long flowing hair, the young princess felt trapped in the castle walls. She was desperate to explore the      ",
      },
    ],
    saved: true,
    error: "",
    loading: true,
  };

  const [state, dispatch] = useReducer<(state: State, action: any) => State>(
    reducer,
    initialState
  );

  useEffect(() => {
    const func = async () => {
      const res = await fetch(`/api/chapter/${chapterid}`, {
        credentials: "include",
      });
      if (!res.ok) {
        dispatch({ type: "setError", payload: res.statusText });
        return;
      }
      const data: t.Chapter = await res.json();
      console.log("got chapter");
      console.log(data);

      dispatch({
        type: "setLoadedChapterData",
        payload: {
          chapter: data,
          suggestions: data.suggestions,
          text: data.text,
          title: data.title,
          chapterid: data.chapterid,
        },
      });

      const response = await fetch("/api/settings", { credentials: "include" });
      const settingsData = await response.json();
      console.log("got settings", settingsData);
      setSettings(settingsData.settings);
      setLoaded(true);
    };
    try {
      func();
    } catch (error) {
      console.error(error);
      dispatch({ type: "setError", payload: error });
    }
  }, [chapterid]);

  useInterval(() => {
    saveChapter(state);
  }, 5000);

  async function onTextEditorSave(state: t.State) {
    await saveChapter(state);
    await saveToHistory(state);
    setTriggerHistoryRerender(t => t + 1);
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
      dispatch({ type: "setError", payload: result.statusText });
      return;
    } else {
      dispatch({ type: "clearError" });
      dispatch({ type: "setSaved", payload: true });
    }
  }

  //let selectedSyllables = countSyllables(state.editor.selectedText.contents);

  /* const infoPanelState = {
    ...state.infoPanel,
    syllables: selectedSyllables,
  };

 */  const addToContents = (text: string) => {
    dispatch({
      type: "addToContents",
      payload: text,
    });
  };

  if (!loaded) {
    if (state.error) {
      return <div>{state.error}</div>;
    }
    return <div>Loading...</div>;
  }

  let editorColSpan = "col-span-4";

  if (sidebarOpen && promptsOpen) {
    editorColSpan = "col-span-2";
  } else if (sidebarOpen || promptsOpen) {
    editorColSpan = "col-span-3";
  }

  return (
    <div className="grid grid-cols-4 w-full h-full">
      <div className={`w-full h-full ${editorColSpan}`}>
        <div className="h-18 xl:h-8 p-sm w-full xl:my-xs flex">
          <div className="flex flex-none">
          <div className="flex-none">
            {!bookListOpen && (
        <button
          type="button"
          className="relative rounded-md inline-flex items-center bg-white dark:bg-dmsidebar dark:hover:bg-dmsidebarSecondary pl-0 pr-3 py-2 text-gray-400  hover:bg-gray-50 ring-0"
          onClick={openBookList}
        >
          <span className="sr-only">Close</span>
            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
          
        </button>)}
      </div>
</div>
          <div className="flex flex-grow" />
          <div className="flex flex-none">
            <button
              type="button"
              className="relative inline-flex items-center rounded-l-md bg-white dark:bg-dmsidebar dark:hover:bg-dmsidebarSecondary dark:text-gray-400 px-2 py-2 text-gray-500   ring-0"
              onClick={() => {
                setPromptsOpen((current) => !current)
                if (!promptsOpen) {
                  closeBookList();
                }

              }}
            >
              <span className="sr-only">Prompts</span>
              <SparklesIcon className="h-6 w-6" aria-hidden="true" />
            </button>

            <button
              type="button"
              className="relative -ml-px inline-flex items-center rounded-r-md bg-white dark:bg-dmsidebar dark:hover:bg-dmsidebarSecondary dark:text-gray-400 px-2 py-2 text-gray-500   ring-0"
              onClick={() => {
                setSidebarOpen((s) => !s);
                if (!sidebarOpen) {
                  closeBookList();
                }

              }
              }
            >
              <span className="sr-only">Sidebar</span>
              <EllipsisHorizontalCircleIcon
                className="h-6 w-6"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
        <div className="h-full w-full">
          {/*    <Toolbar
              dispatch={dispatch as any}
              state={state.editor}
              settings={settings}
            /> */}
          {state.error && (
            <div className="m-0 p-sm bg-red-700 w-full">
              <p>{state.error}</p>
              {/* <XMarkIcon
                  className="h-sm"
                  onClick={() => dispatch("clearError")}
                /> */}
            </div>
          )}

          <TextEditor
            dispatch={dispatch as any}
            state={state.editor}
            saved={state.saved}
            settings={settings}
            onSave={() => onTextEditorSave(state)}
          />
        </div>
      </div>
      {promptsOpen && (
        <div className="col-span-1 min-h-screen">
          <PromptsSidebar
            dispatch={dispatch as any}
            state={state.editor}
            settings={settings}
            closeSidebar={() => setPromptsOpen(false)}
            onLoad={() => {
              setSidebarOpen(true);
            }}
          />
        </div>
      )}
      {sidebarOpen && (
        <div className="col-span-1 min-h-screen">
          <Sidebar
            state={state}
            settings={settings}
            setSettings={setSettings}
            closeSidebar={() => setSidebarOpen(false)}
            onSuggestionClick={addToContents}
            onSuggestionDelete={(index) => {
              dispatch({ type: "deleteSuggestion", payload: index });
            }}
            onSettingsSave={() => {}}
            triggerHistoryRerender={triggerHistoryRerender}
          />
        </div>
      )}
    </div>
  );
}
