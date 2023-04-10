import React, { Fragment, Reducer, useEffect, useState } from "react";
import * as t from "./Types";
import "./globals.css";
import Button from "./components/Button";
import { TrashIcon } from "@heroicons/react/24/solid";
import BookList from "./BookList";
import { useParams } from "react-router-dom";
import ChapterList from "./ChapterList";
import Editor from "./Editor";
import * as fd from "./fetchData";
import { initialState, reducer } from "./reducers/library";
import { useInterval, useLocalStorage } from "./utils";
import Launcher from "./Launcher";
import {
  CheckCircleIcon,
  ChevronRightIcon,
  EllipsisHorizontalCircleIcon,
  MinusIcon,
  PlusIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import PromptsSidebar from "./PromptsSidebar";
import Sidebar from "./Sidebar";
import { NavButton } from "./NavButton";

export default function Library() {
  const [state, dispatch] = React.useReducer<Reducer<t.State, t.ReducerAction>>(
    reducer,
    initialState(null)
  );
  const [settings, setSettings] = useState<t.UserSettings>({
    model: "",
    max_tokens: 0,
    num_suggestions: 0,
    theme: "default",
    version_control: false,
    prompts: [],
  });

  const [bookListOpen, setBookListOpen] = useLocalStorage("bookListOpen", true);
  const [chapterListOpen, setChapterListOpen] = useLocalStorage(
    "chapterListOpen",
    true
  );
  const [sidebarOpen, setSidebarOpen] = useLocalStorage("sidebarOpen", false);
  const [promptsOpen, setPromptsOpen] = useLocalStorage("promptsOpen", false);
  const [triggerHistoryRerender, setTriggerHistoryRerender] = useState(0);

  const { bookid, chapterid } = useParams();

  useEffect(() => {
    if (chapterid && state.selectedBook) {
      const chapter = state.selectedBook.chapters.find(
        (c: t.Chapter) => c.chapterid === chapterid
      );
      if (chapter) {
        dispatch({ type: "SET_CHAPTER", payload: chapter });
        return;
      }
    }
    dispatch({ type: "SET_NO_CHAPTER" });
  }, [chapterid, state.selectedBook]);

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      if (sidebarOpen || promptsOpen || bookListOpen || chapterListOpen) {
        setSidebarOpen(false);
        setPromptsOpen(false);
        setBookListOpen(false);
        setChapterListOpen(false);
      } else {
        setSidebarOpen(true);
        setPromptsOpen(true);
        setBookListOpen(true);
        setChapterListOpen(true);
      }
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const fetchBook = async () => {
    if (!bookid) {
      return;
    }
    const result = await fd.fetchBook(bookid);
    if (result.tag === "success") {
      dispatch({ type: "SET_BOOK", payload: result.payload });
    } else {
      dispatch({ type: "SET_ERROR", payload: result.message });
    }
  };

  useEffect(() => {
    fetchBook();
  }, [bookid]);

  // if the chapter id is null set the book list open to true
  // so that we do not end up with an empty screen.
  useEffect(() => {
    if (!chapterid) {
      setBookListOpen(true);
    }
  }, [chapterid]);

  // Force the chapter list open if a chapter has not been selected but a
  // book has.
  useEffect(() => {
    if (!chapterid && state.selectedBook) {
      setChapterListOpen(true);
    }
  }, [state.selectedBook, chapterid]);

  const fetchBooks = async () => {
    const result = await fd.fetchBooks();
    console.log("result", result);
    if (result.tag === "success") {
      dispatch({ type: "SET_BOOKS", payload: result.payload });
    } else {
      dispatch({ type: "SET_ERROR", payload: result.message });
    }
  };

  const fetchSettings = async () => {
    const result = await fd.fetchSettings();
    console.log("result", result);
    if (result.tag === "success") {
      setSettings(result.payload);
    } else {
      dispatch({ type: "SET_ERROR", payload: result.message });
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchSettings();
  }, []);

  async function deleteBook(bookid: string) {
    const res = await fetch(`/api/deleteBook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bookid }),
    });
    if (!res.ok) {
      dispatch({ type: "SET_ERROR", payload: res.statusText });
      return;
    }
  }

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

  useInterval(() => {
    saveChapter(state);
  }, 5000);

  const addToContents = (text: string) => {
    dispatch({
      type: "ADD_TO_CONTENTS",
      payload: text,
    });
  };

  const launchItems = [
    /* 
        {
          label: "Save",
          onClick: () => {
            saveBook(state);
          },
          icon: <SaveIcon className="h-4 w-4" aria-hidden="true" />,
        }, */
    {
      label: "New Chapter",
      onClick: () => {},
      icon: <PlusIcon className="h-4 w-4" aria-hidden="true" />,
    },
  ];

  const selectedBookId = state.selectedBook ? state.selectedBook.bookid : "";
  try {
    console.log(state.chapter.chapterid, "<<<");
  } catch (e) {}
  return (
    <div className="h-screen">
      <Launcher items={launchItems} />
      {state.error && <div className="text-red-500">{state.error}</div>}
      <div className="flex h-full">
        {bookListOpen && (
          <div className="flex-none w-36 xl:w-48 h-full">
            <BookList
              books={state.books}
              selectedBookId={selectedBookId}
              onChange={fetchBooks}
              closeSidebar={() => setBookListOpen(false)}
              canCloseSidebar={chapterid !== undefined}
            />
          </div>
        )}
        {chapterListOpen && state.selectedBook && (
          <div className="flex-none w-40 xl:w-48 h-full">
            <ChapterList
              chapters={state.selectedBook.chapters}
              bookid={state.selectedBook.bookid}
              selectedChapterId={chapterid || ""}
              onChange={() => fetchBook()}
              closeSidebar={() => setChapterListOpen(false)}
              canCloseSidebar={chapterid !== undefined || !state.selectedBook}
            />
          </div>
        )}

        <div className={`h-full flex flex-col flex-grow`}>
          <div className="flex-none h-fit m-xs flex">
            <div className="flex-none">
              {(!bookListOpen || !chapterListOpen) && (
                <button
                  type="button"
                  className="relative rounded-md inline-flex items-center bg-white dark:hover:bg-dmsidebar dark:bg-dmsidebarSecondary pl-0 pr-3 py-2 text-gray-400  hover:bg-gray-50 ring-0 "
                  onClick={() => {
                    setBookListOpen(true);
                    setChapterListOpen(true);
                  }}
                >
                  <span className="sr-only">Open</span>
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="flex-grow" />
            <div className="flex-none">
              {!state.saved && (
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
              )}

              <NavButton
                label="Prompts"
                onClick={() => {
                  setPromptsOpen((current) => !current);
                  if (!promptsOpen) {
                    setBookListOpen(false);
                    setChapterListOpen(false);
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
                    setBookListOpen(false);
                    setChapterListOpen(false);
                  }
                }}
              >
                <EllipsisHorizontalCircleIcon
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </NavButton>
            </div>
          </div>
          <div className="flex-grow h-full w-full">
            {state.chapter && (
              <Editor
                state={state}
                dispatch={dispatch}
                onSave={onTextEditorSave}
              />
            )}
          </div>
          {/*  we run a risk of the book id being closed and not being able to be reopened */}
        </div>
        {promptsOpen && state.chapter && (
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

        {sidebarOpen && state.chapter && (
          <div className="w-48 xl:w-48 flex-none min-h-screen">
            <Sidebar
              state={state}
              settings={settings}
              setSettings={setSettings}
              closeSidebar={() => setSidebarOpen(false)}
              onSuggestionClick={addToContents}
              onSuggestionDelete={(index) => {
                dispatch({ type: "DELETE_SUGGESTION", payload: index });
              }}
              onSettingsSave={() => {}}
              onHistoryClick={async (newText) => {
                console.log("newText", newText);

                await onTextEditorSave(state);

                dispatch({ type: "PUSH_TEXT_TO_EDITOR", payload: newText });
              }}
              triggerHistoryRerender={triggerHistoryRerender}
            />
          </div>
        )}
      </div>
    </div>
  );
}
