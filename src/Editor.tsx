import { syllable } from "syllable";
import React, { useState, useRef, useReducer, useEffect } from "react";
import produce, { current } from "immer";
import "./globals.css";
import TextEditor from "./TextEditor";
import Sidebar from "./Sidebar";
import InfoPanel from "./InfoPanel";
import { EditorState, State } from "./Types";
import Panel from "./components/Panel";
import SuggestionPanel from "./SuggestionPanel";
import { useParams } from "react-router-dom";
import * as t from "./Types";
import { useInterval } from "./utils";
import Settings from "./Settings";
import Toolbar from "./Toolbar";
import SlideOver from "./components/SlideOver";
import Button from "./components/Button";
import { XMarkIcon } from "@heroicons/react/24/solid";
import History from "./History";
const countSyllables = (text: string) => {
  try {
    return syllable(text);
  } catch (error) {
    console.error("Error counting syllables:", error);
    return 0;
  }
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

export default function Editor(
  {
    /*   book,
  setTitle,
  setText, */
  } /* : {
  book: t.Book;
  setTitle: (chapterID: string, newTitle: string) => void;
  setText: (chapterID: string, newText: string) => void;
} */
) {
  const { chapterid } = useParams();

  const [loaded, setLoaded] = React.useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<t.UserSettings>({
    model: "",
    max_tokens: 0,
    num_suggestions: 0,
    theme: "default",
    version_control: false,
    prompts: [],
  });

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
      /*   dispatch({ type: "setChapter", payload: data });
      dispatch({ type: "setSuggestions", payload: data.suggestions });
      dispatch({ type: "setText", payload: data.text });
      dispatch({ type: "setTitle", payload: data.title }); */
      // dispatch({ type: "setSaved", payload: true });
      dispatch({
        type: "setLoadedChapterData",
        payload: {
          chapter: data,
          suggestions: data.suggestions,
          text: data.text,
          title: data.title,
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
  }, []);

  useInterval(() => {
    saveChapter(state);
  }, 5000);

  async function onTextEditorSave(state: t.State) {
    await saveChapter(state);
    await saveToHistory(state);
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

  const initialEditorState: EditorState = {
    title: "",
    text: "",
    contents: {},
    tooltipPosition: { top: 0, left: 0 },
    tooltipOpen: false,
    selectedText: { index: 0, length: 0, contents: "" },
  };

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

  let selectedSyllables = countSyllables(state.editor.selectedText.contents);

  const infoPanelState = {
    ...state.infoPanel,
    syllables: selectedSyllables,
  };

  const addToContents = (text: string) => {
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

  return (
    <div className="grid grid-cols-10">
      <div className="col-span-8">
        <div>
          <div className="">
            <Toolbar
              dispatch={dispatch as any}
              state={state.editor}
              settings={settings}
            />
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
      </div>

      <div className="col-span-2 min-h-screen">
        <Sidebar
          setSettingsOpen={setSettingsOpen}
          setHistoryOpen={setHistoryOpen}
          bookid={state.chapter.bookid}
        >
          {/* <a
            className="text-sm text-gray-500 m-sm"
            href={`/book/${state.chapter.bookid}`}
          >
            Back to book
          </a> */}
          {/*  <InfoPanel state={infoPanelState} /> */}
          {state.suggestions.map((suggestion, index) => (
            <SuggestionPanel
              key={index}
              title={suggestion.type}
              contents={suggestion.contents}
              onClick={addToContents}
              onDelete={() => {
                dispatch({ type: "deleteSuggestion", payload: index });
              }}
            />
          ))}
        </Sidebar>
        <SlideOver
          title="Settings"
          open={settingsOpen}
          setOpen={setSettingsOpen}
        >
          <Settings
            settings={settings}
            setSettings={setSettings}
            onSave={() => setSettingsOpen(false)}
          />
        </SlideOver>
        <SlideOver
          title="History"
          open={historyOpen}
          setOpen={setHistoryOpen}
          size="large"
        >
          <History
            /*  history={history}
            sethistory={setHistory} */
            chapterid={state.chapter.chapterid}
            onSave={() => setHistoryOpen(false)}
          />
        </SlideOver>
      </div>
    </div>
  );
}
