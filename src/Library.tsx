import React, { Fragment, Reducer, useEffect, useState } from "react";
import * as t from "./Types";
import "./globals.css";
import Button from "./components/Button";
import {
  ClipboardIcon,
  ClockIcon,
  InformationCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import BookList from "./BookList";
import { useNavigate, useParams } from "react-router-dom";
import ChapterList from "./ChapterList";
import Editor from "./Editor";
import * as fd from "./fetchData";
import { initialState, reducer } from "./reducers/library";
import { fetchSuggestionsWrapper, useInterval, useLocalStorage } from "./utils";
import Launcher from "./Launcher";
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  Bars3BottomLeftIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  DocumentArrowDownIcon,
  EllipsisHorizontalCircleIcon,
  MinusIcon,
  PlusIcon,
  SparklesIcon,
  ViewColumnsIcon,
} from "@heroicons/react/24/outline";
import PromptsSidebar from "./PromptsSidebar";
import Sidebar from "./Sidebar";
import { NavButton } from "./NavButton";
import Spinner from "./components/Spinner";

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
  const [activePanel, setActivePanel] = useLocalStorage(
    "activePanel",
    "suggestions"
  );

  const [triggerHistoryRerender, setTriggerHistoryRerender] = useState(0);

  const [maximize, setMaximize] = useLocalStorage("maximize", false);
  const width = maximize ? "w-96" : "w-48 xl:w-72";

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
  }, [chapterid, state.selectedBook?.bookid]);

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      if (maximize) {
        setMaximize(false);
      } else if (
        sidebarOpen ||
        promptsOpen ||
        bookListOpen ||
        chapterListOpen
      ) {
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
    setLoading(true);
    const result = await fd.fetchBook(bookid);
    setLoading(false);
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
    setLoading(true);
    const result = await fd.fetchBooks();
    setLoading(false);
    console.log("result", result);
    if (result.tag === "success") {
      dispatch({ type: "SET_BOOKS", payload: result.payload });
    } else {
      dispatch({ type: "SET_ERROR", payload: result.message });
    }
  };

  const fetchSettings = async () => {
    setLoading(true);
    const result = await fd.fetchSettings();
    setLoading(false);
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
    await saveBook(state.selectedBook);
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
    const func = async () => {
      await saveChapter(state);
      await saveBook(state.selectedBook);
    };
    func();
  }, 5000);

  async function saveBook(_book: t.Book) {
    if (state.saved) return;
    if (!_book) {
      console.log("no book");
      return;
    }

    const book = { ..._book };

    console.log("saving book", book);
    book.chapters = [];
    const body = JSON.stringify({ book });
    const result = await fetch("/api/saveBook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });
  }

  const addToContents = (text: string) => {
    dispatch({
      type: "ADD_TO_CONTENTS",
      payload: text,
    });
  };

  const togglePanel = (panel: string) => {
    if (sidebarOpen && activePanel === panel) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
      setActivePanel(panel);
    }
  };

  function onSuggestionLoad() {
    setSidebarOpen(true);
  }

  function setLoading(bool) {
    if (bool) {
      dispatch({ type: "LOADING" });
    } else {
      dispatch({ type: "LOADED" });
    }
  }

  const navigate = useNavigate();
  const launchItems = [
    {
      label: "Save",
      onClick: () => {
        onTextEditorSave(state);
      },
      icon: <DocumentArrowDownIcon className="h-4 w-4" aria-hidden="true" />,
    },
    {
      label: "New Chapter",
      onClick: async () => {
        dispatch({ type: "LOADING" });
        const result = await fd.newChapter(bookid, "New Chapter", "");
        dispatch({ type: "LOADED" });
        if (result.tag === "error") {
          dispatch({ type: "SET_ERROR", payload: result.message });
        }
        await fetchBook();
      },
      icon: <PlusIcon className="h-4 w-4" aria-hidden="true" />,
    },
    {
      label: "Grid",
      icon: <ViewColumnsIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
      onClick: () => {
        navigate(`/grid/${bookid}`);
      },
    },
    {
      label: bookListOpen ? "Close Book List" : "Open Book List",
      icon: <ViewColumnsIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
      onClick: () => {
        setBookListOpen(!bookListOpen);
      },
    },
    {
      label: chapterListOpen ? "Close Chapter List" : "Open Chapter List",
      icon: <ViewColumnsIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
      onClick: () => {
        setChapterListOpen(!chapterListOpen);
      },
    },
    {
      label: promptsOpen ? "Close Prompts" : "Open Prompts",
      icon: <ViewColumnsIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
      onClick: () => {
        setPromptsOpen(!promptsOpen);
      },
    },
    {
      label:
        sidebarOpen && activePanel == "history"
          ? "Close History"
          : "Open History",
      icon: <ClockIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
      onClick: () => {
        togglePanel("history");
      },
    },
    {
      label: sidebarOpen && activePanel == "info" ? "Close Info" : "Open Info",
      icon: <InformationCircleIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
      onClick: () => {
        togglePanel("info");
      },
    },
    {
      label:
        sidebarOpen && activePanel == "suggestions"
          ? "Close Suggestions"
          : "Open Suggestions",
      icon: <ClipboardIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
      onClick: () => {
        togglePanel("suggestions");
      },
    },
    {
      label:
        sidebarOpen && activePanel == "settings"
          ? "Close Settings"
          : "Open Settings",
      icon: <Cog6ToothIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
      onClick: () => {
        togglePanel("settings");
      },
    },
  ];

  if (state.books) {
    state.books.forEach((book, i) => {
      book.chapterTitles.forEach((chapter, i) => {
        launchItems.push({
          label: chapter.title || "(No title)",
          onClick: () => {
            navigate(`/book/${book.bookid}/chapter/${chapter.chapterid}`);
          },
          icon: <Bars3BottomLeftIcon className="h-4 w-4" aria-hidden="true" />,
        });
      });
    });
  }

  state.books.forEach((book, i) => {
    launchItems.push({
      label: book.title,
      onClick: () => {
        navigate(`/book/${book.bookid}`);
      },
      icon: <BookOpenIcon className="h-4 w-4" aria-hidden="true" />,
    });
  });

  settings.prompts.forEach((prompt, i) => {
    launchItems.push({
      label: prompt.label,
      onClick: () => {
        fetchSuggestionsWrapper(
          state.editor,
          settings,
          setLoading,
          dispatch,
          onSuggestionLoad,
          prompt.text,
          prompt.label
        );
      },
      icon: <SparklesIcon className="h-4 w-4" aria-hidden="true" />,
    });
  });

  if (sidebarOpen) {
    launchItems.push({
      label: "Close Sidebar",
      onClick: () => {
        setSidebarOpen(false);
      },
      icon: <ViewColumnsIcon className="h-4 w-4" aria-hidden="true" />,
    });
  } else {
    launchItems.push({
      label: "Open Sidebar",
      onClick: () => {
        setSidebarOpen(true);
      },
      icon: <ViewColumnsIcon className="h-4 w-4" aria-hidden="true" />,
    });
  }

  if (maximize) {
    launchItems.push({
      label: "Exit Fullscreen",
      onClick: () => {
        setMaximize(false);
      },
      icon: <ArrowsPointingInIcon className="h-4 w-4" aria-hidden="true" />,
    });
  } else {
    launchItems.push({
      label: "View Sidebar In Fullscreen",
      onClick: () => {
        setMaximize(true);
      },
      icon: <ArrowsPointingOutIcon className="h-4 w-4" aria-hidden="true" />,
    });
  }

  const chapterlistChapters = [];

  if (state.selectedBook && state.selectedBook.chapterTitles) {
    state.selectedBook.chapterTitles.forEach((chaptertitle) => {
      const chapter = state.selectedBook.chapters.find(
        (c) => c.chapterid === chaptertitle.chapterid
      );
      if (chapter) {
        chapterlistChapters.push(chapter);
      } else {
        console.log("chapter not found", chaptertitle);
      }
    });
  }

  const sidebarWidth = maximize ? "w-96" : "w-48 xl:w-72";

  if (maximize && state.chapter && state.chapter.chapterid) {
    return (
      <div className={`w-3/4 mx-auto flex-none min-h-screen`}>
        <Launcher items={launchItems} />

        <Sidebar
          state={state}
          settings={settings}
          setSettings={setSettings}
          activePanel={activePanel}
          setActivePanel={setActivePanel}
          closeSidebar={() => setSidebarOpen(false)}
          maximize={maximize}
          setMaximize={setMaximize}
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
    );
  }

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
              chapters={chapterlistChapters}
              bookid={state.selectedBook.bookid}
              selectedChapterId={chapterid || ""}
              onChange={() => fetchBook()}
              closeSidebar={() => setChapterListOpen(false)}
              canCloseSidebar={chapterid !== undefined || !state.selectedBook}
              dispatch={dispatch}
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
            {chapterid && (
              <div className="flex-none">
                {state.loading && (
                  <NavButton label="Loading" onClick={() => {}} className="p-0">
                    <Spinner className="w-5 h-5" />
                  </NavButton>
                )}

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
            )}
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
          <div className={`${sidebarWidth} flex-none min-h-screen`}>
            <Sidebar
              state={state}
              settings={settings}
              setSettings={setSettings}
              activePanel={activePanel}
              setActivePanel={setActivePanel}
              closeSidebar={() => setSidebarOpen(false)}
              maximize={maximize}
              setMaximize={setMaximize}
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
