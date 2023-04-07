import PromptsSidebar from "./PromptsSidebar";
import React, { useState, useRef, useReducer, useEffect } from "react";
import "./globals.css";
import TextEditor from "./TextEditor";
import Sidebar from "./Sidebar";
import { EditorState, State } from "./Types";
import * as t from "./Types";
import { useInterval, useLocalStorage } from "./utils";
import { initialState, reducer } from "./reducers/editor";
import {
  CheckCircleIcon,
  ChevronRightIcon,
  EllipsisHorizontalCircleIcon,
  MinusIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { NavButton } from "./NavButton";



export default function Editor({ chapterid, bookListOpen,  chapterListOpen, openBookList, closeBookList }: { chapterid: string; bookListOpen: boolean; chapterListOpen: boolean; openBookList: () => void; closeBookList: () => void }) {
  console.log("chapterid", chapterid);
  const [loaded, setLoaded] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = useLocalStorage("sidebarOpen", false);
  const [promptsOpen, setPromptsOpen] = useLocalStorage("promptsOpen", false);
  const [triggerHistoryRerender, setTriggerHistoryRerender] = useState(0);
  const [settings, setSettings] = useState<t.UserSettings>({
    model: "",
    max_tokens: 0,
    num_suggestions: 0,
    theme: "default",
    version_control: false,
    prompts: [],
  });

  const [state, dispatch] = useReducer<(state: State, action: any) => State>(
    reducer,
    initialState(chapterid)
  );

  const handleKeyDown = (event) => {    
    if (event.key === "Escape") {
      event.preventDefault();
      if (sidebarOpen || promptsOpen || bookListOpen || chapterListOpen) {     
        setSidebarOpen(false);
        setPromptsOpen(false);
        closeBookList();
      } else {
        setSidebarOpen(true);
        setPromptsOpen(true);

        openBookList();
      }
    }
  };

  useEffect(() => {    
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

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
          
        </button>)}
      </div>
</div>
          <div className="flex flex-grow" />
          <div className="flex flex-none">

          {!state.saved && <NavButton label="Unsaved" onClick={() => {              
              }}>
          <MinusIcon className="h-5 w-5" aria-hidden="true" />
        </NavButton>}

        {state.saved && <NavButton label="Unsaved" onClick={() => {              
              }}>
          <CheckCircleIcon className="h-5 w-5 text-green-700 dark:text-green-300" aria-hidden="true" />
        </NavButton>}

          <NavButton label="Prompts" onClick={() => {
                setPromptsOpen((current) => !current)
                if (!promptsOpen) {
                  closeBookList();
                }

              }}>
          <SparklesIcon className="h-5 w-5" aria-hidden="true" />
        </NavButton>
           
        <NavButton label="Sidebar" onClick={() => {
                setSidebarOpen((s) => !s);
                if (!sidebarOpen) {
                  closeBookList();
                }

              }
              }>
                      <EllipsisHorizontalCircleIcon
                className="h-5 w-5"
                aria-hidden="true"
              />
        </NavButton>

        
          </div>
        </div>
        <div className="h-full w-full">         
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
        <div className="w-36 xl:w-48 flex-none min-h-screen">
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
        <div className="w-48 xl:w-48 flex-none min-h-screen">
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
