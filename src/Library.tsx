import React, { Reducer, useCallback, useEffect, useState } from "react";
import * as t from "./Types";
import "./globals.css";

import {
  ClipboardIcon,
  ClockIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import BookList from "./BookList";
import { useNavigate, useParams } from "react-router-dom";
import ChapterList from "./ChapterList";
import Editor from "./Editor";
import * as fd from "./fetchData";
import { fetchSuggestionsWrapper, getCsrfToken, useInterval } from "./utils";
import Launcher from "./Launcher";
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  Bars3BottomLeftIcon,
  Bars3Icon,
  BarsArrowDownIcon,
  BarsArrowUpIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  DocumentArrowDownIcon,
  EllipsisHorizontalCircleIcon,
  EyeIcon,
  MinusIcon,
  PlusIcon,
  SparklesIcon,
  ViewColumnsIcon,
} from "@heroicons/react/24/outline";
import PromptsSidebar from "./PromptsSidebar";
import Sidebar from "./Sidebar";
import NavButton from "./NavButton";
import Spinner from "./components/Spinner";
import FocusMode from "./FocusMode";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./store";
import {
  fetchBooksThunk,
  getSelectedBook,
  getSelectedBookChapters,
  getSelectedChapter,
  librarySlice,
} from "./reducers/librarySlice";
import useLaunchItems from "./launchItems";

export default function Library() {
  const state = useSelector((state: RootState) => state.library);
  const selectedBook = useSelector(getSelectedBook);

  const currentChapter = getSelectedChapter({ library: state });

  const dispatch = useDispatch<AppDispatch>();
  const [settings, setSettings] = useState<t.UserSettings>({
    model: "",
    max_tokens: 0,
    num_suggestions: 0,
    theme: "default",
    version_control: false,
    prompts: [],
  });

  const [triggerHistoryRerender, setTriggerHistoryRerender] = useState(0);

  const { bookid, chapterid } = useParams();

  useEffect(() => {
    if (chapterid && state.booksLoaded) {
      dispatch(librarySlice.actions.setChapter(chapterid));
      return;
    }
    dispatch(librarySlice.actions.setNoChapter());
  }, [chapterid, state.selectedBookId, state.booksLoaded]);

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      if (state.launcherOpen) {
        dispatch(librarySlice.actions.toggleLauncher());
      } else if (state.viewMode === "fullscreen") {
        dispatch(librarySlice.actions.setViewMode("default"));
      } else if (state.viewMode === "focus") {
        focusModeClose();
      } else if (
        state.panels.sidebar.open ||
        state.panels.prompts.open ||
        state.panels.bookList.open ||
        state.panels.chapterList.open
      ) {
        dispatch(librarySlice.actions.closeAllPanels());
      } else {
        dispatch(librarySlice.actions.openAllPanels());
      }
    } else if (event.metaKey && event.shiftKey && event.key === "p") {
      event.preventDefault();
      dispatch(librarySlice.actions.toggleLauncher());
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (bookid) {
      dispatch(librarySlice.actions.setBook(bookid));
    }
  }, [bookid]);

  // if the chapter id is null set the book list open to true
  // so that we do not end up with an empty screen.
  useEffect(() => {
    if (!chapterid) {
      dispatch(librarySlice.actions.openBookList());
    }
  }, [chapterid]);

  // Force the chapter list open if a chapter has not been selected but a
  // book has.
  useEffect(() => {
    if (!chapterid && state.selectedBookId) {
      dispatch(librarySlice.actions.openChapterList());
    }
  }, [state.selectedBookId, chapterid]);

  const fetchBooks = async () => {
    dispatch(fetchBooksThunk());
  };

  const fetchSettings = async () => {
    setLoading(true);
    const result = await fd.fetchSettings();
    setLoading(false);

    if (result.tag === "success") {
      setSettings(result.payload);
    } else {
      dispatch(librarySlice.actions.setError(result.message));
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchSettings();
  }, []);

  const navigate = useNavigate();

  function togglePanel(panel: string) {
    if (
      state.panels.sidebar.open &&
      state.panels.sidebar.activePanel === panel
    ) {
      dispatch(librarySlice.actions.closeSidebar());
    } else {
      dispatch(librarySlice.actions.openSidebar());
      dispatch(librarySlice.actions.setActivePanel(panel));
    }
  }

  function onSuggestionLoad() {
    dispatch(librarySlice.actions.openSidebar());
    dispatch(librarySlice.actions.setActivePanel("suggestions"));
  }

  // todo memoize these
  const launchItems = useLaunchItems(
    onTextEditorSave,
    dispatch,
    bookid,
    togglePanel,
    navigate,
    settings,
    fetchSuggestionsWrapper,
    setLoading,
    onSuggestionLoad
  );

  const onLauncherClose = useCallback(
    () => dispatch(librarySlice.actions.toggleLauncher()),
    []
  );

  async function onTextEditorSave(state: t.State) {
    await saveChapter(currentChapter, state.suggestions);

    if (!selectedBook) return;
    await saveBook(selectedBook);
    await saveToHistory(state);
    setTriggerHistoryRerender((t) => t + 1);
  }

  async function saveToHistory(state: t.State) {
    const body = JSON.stringify({
      chapterid: currentChapter.chapterid,
      text: currentChapter.text.map((t) => t.text).join("\n---\n"),
      csrfToken: getCsrfToken(),
    });

    const result = await fetch("/api/saveToHistory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body,
    });
  }

  async function saveChapter(_chapter: t.Chapter, suggestions: t.Suggestion[]) {
    const chapter = { ..._chapter };
    chapter.suggestions = suggestions;

    const body = JSON.stringify({ chapter, csrfToken: getCsrfToken() });
    const result = await fetch("/api/saveChapter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    if (!result.ok) {
      dispatch(librarySlice.actions.setError(result.statusText));
    } else {
      dispatch(librarySlice.actions.clearError());
      dispatch(librarySlice.actions.setSaved(true));
      // Since we depend on a cache version of the selected book when picking a chapter
      // we must also set the chapter on said cache whenever save occurs.
      // This avoids the issue in which switching a chapter looses your last saved work.
      dispatch(librarySlice.actions.setSelectedBookChapter(chapter));
    }
  }

  useInterval(() => {
    const func = async () => {
      if (state.saved) return;
      if (currentChapter) {
        await saveChapter(currentChapter, state.suggestions);
      }
      if (!selectedBook) return;
      await saveBook(selectedBook);
    };
    func();
  }, 5000);

  const onEditorSave = useCallback(() => onTextEditorSave(state), []);

  async function saveBook(_book: t.Book) {
    if (!_book) {
      console.log("no book");
      return;
    }

    const book = { ..._book };

    book.chapters = [];
    const body = JSON.stringify({ book, csrfToken: getCsrfToken() });
    const result = await fetch("/api/saveBook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });
  }

  const addToContents = (text: string) => {
    dispatch(librarySlice.actions.addToContents(text));
  };

  function setLoading(bool) {
    if (bool) {
      dispatch(librarySlice.actions.loading());
    } else {
      dispatch(librarySlice.actions.loaded());
    }
  }

  if (!state.booksLoaded) {
    return <div>Loading...</div>;
  }

  const sidebarWidth =
    state.viewMode === "fullscreen" ? "w-96" : "w-48 xl:w-72";

  function focusModeClose() {
    dispatch(librarySlice.actions.setViewMode("default"));

    /* let selected = state.editor.selectedText;
    if (
      state.editor.selectedText.contents === ""
      && state.editor._cachedSelectedText
    ) {
      if (state.editor._cachedSelectedText.contents !== "") {
        selected = state.editor._cachedSelectedText;
      } else {
        selected = { index: 0, length: 0, contents: "" };
      }
    }

    let replacement;
    if (selected.length > 0) {
      replacement = replace(
        // TODO which text index?
        currentChapter.text,
        selected.index,
        selected.index + selected.length,
        state._temporaryFocusModeState,
      );
    } else {
      // no selection, just replace the whole thing,
      // Because we went into focus mode with no selection
      replacement = state._temporaryFocusModeState;
    }

    // TODO not sure how multiple texts work w focus mode
    dispatch(
      librarySlice.actions.pushTextToEditor({ index: 0, text: replacement }),
    ); */
  }

  function replace(full, start, end, replacement) {
    return full.substring(0, start) + replacement + full.substring(end);
  }

  if (state.viewMode === "focus" && currentChapter) {
    let text = state.editor.selectedText.contents;
    if (!text && state.editor._cachedSelectedText) {
      text = state.editor._cachedSelectedText.contents;
    }
    if (!text && currentChapter && currentChapter.text) {
      // TODO
      text = currentChapter.text.map((t) => t.text).join("\n");
    }
    return (
      <div>
        <FocusMode
          text={text}
          onClose={focusModeClose}
          onChange={(text) => {
            dispatch(librarySlice.actions.setTemporaryFocusModeState(text));
          }}
        />
        <Launcher
          items={[
            {
              label: "Exit Focus Mode",
              onClick: () => {
                focusModeClose();
              },
              icon: <EyeIcon className="h-4 w-4" aria-hidden="true" />,
            },
          ]}
          open={state.launcherOpen}
          close={onLauncherClose}
        />
      </div>
    );
  }

  if (state.viewMode === "fullscreen" && currentChapter) {
    return (
      <div className="w-3/4 mx-auto flex-none h-screen overflow-scroll">
        <Launcher
          items={launchItems}
          open={state.launcherOpen}
          close={onLauncherClose}
        />

        <Sidebar
          settings={settings}
          setSettings={setSettings}
          activePanel={state.panels.sidebar.activePanel}
          setActivePanel={(panel) =>
            dispatch(librarySlice.actions.setActivePanel(panel))
          }
          maximize={state.viewMode === "fullscreen"}
          onSuggestionClick={addToContents}
          onSuggestionDelete={(index) => {
            dispatch(librarySlice.actions.deleteSuggestion(index));
          }}
          onSettingsSave={() => {}}
          onHistoryClick={async (newText) => {
            await onTextEditorSave(state);
            dispatch(
              librarySlice.actions.pushTextToEditor({ index: 0, text: newText })
            );
          }}
          triggerHistoryRerender={triggerHistoryRerender}
        />
      </div>
    );
  }

  return (
    <div className="h-screen">
      <Launcher
        items={launchItems}
        open={state.launcherOpen}
        close={onLauncherClose}
      />
      {state.error && (
        <div className="bg-red-700 p-2 text-white">{state.error}</div>
      )}
      <div className="flex h-full">
        {state.panels.bookList.open && (
          <div className="flex-none w-36 xl:w-48 h-full">
            <BookList
              books={state.books}
              selectedBookId={state.selectedBookId}
              onChange={fetchBooks}
              onDelete={(deletedBookid) => {
                dispatch(librarySlice.actions.deleteBook(deletedBookid));
                if (deletedBookid === bookid) {
                  dispatch(librarySlice.actions.noBookSelected());
                  navigate("/");
                }
              }}
              canCloseSidebar={chapterid !== undefined}
              saveBook={saveBook}
            />
          </div>
        )}
        {state.panels.chapterList.open &&
          state.selectedBookId &&
          state.booksLoaded && (
            <div className="flex-none w-40 xl:w-48 h-full">
              <ChapterList
                bookid={state.selectedBookId}
                selectedChapterId={chapterid || ""}
                onDelete={(deletedChapterid) => {
                  dispatch(
                    librarySlice.actions.deleteChapter(deletedChapterid)
                  );
                  if (deletedChapterid === chapterid) {
                    dispatch(librarySlice.actions.noChapterSelected());
                    navigate(`/book/${state.selectedBookId}`);
                  }
                }}
                saveChapter={(chapter) => saveChapter(chapter, [])}
                closeSidebar={() =>
                  dispatch(librarySlice.actions.closeChapterList())
                }
                canCloseSidebar={
                  chapterid !== undefined || !state.selectedBookId
                }
              />
            </div>
          )}

        <div className="h-full flex flex-col flex-grow">
          <div className="flex-none h-fit m-xs flex">
            <div className="flex-none">
              {(!state.panels.bookList.open ||
                !state.panels.chapterList.open) && (
                /*       <button
                  type="button"
                  className="relative rounded-md inline-flex items-center bg-white dark:hover:bg-dmsidebar dark:bg-dmsidebarSecondary pl-0 pr-3 py-2 text-gray-400  hover:bg-gray-50 ring-0 "
                  onClick={() => {

                  }}
                  data-selector
                >
                  <span className="sr-only">Open</span>
                </button> */

                <NavButton
                  label="Open"
                  onClick={() => {
                    dispatch(librarySlice.actions.openBookList());
                    dispatch(librarySlice.actions.openChapterList());
                  }}
                  className="p-0"
                  selector="open-lists-button"
                >
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </NavButton>
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

                {/*                 <NavButton
                  label="Focus Mode"
                  onClick={() =>
                    dispatch(librarySlice.actions.setViewMode("focus"))
                  }
                >
                  <EyeIcon className="h-5 w-5" aria-hidden="true" />
                </NavButton>
 */}
                {!state.saved && (
                  <NavButton label="Unsaved" onClick={() => {}}>
                    <MinusIcon className="h-5 w-5" aria-hidden="true" />
                  </NavButton>
                )}

                {state.saved && (
                  <NavButton label="Saved" onClick={() => {}}>
                    <CheckCircleIcon
                      className="h-5 w-5 text-green-700 dark:text-green-300"
                      aria-hidden="true"
                    />
                  </NavButton>
                )}

                <NavButton
                  label="Prompts"
                  onClick={() => {
                    dispatch(librarySlice.actions.togglePrompts());
                    if (!state.panels.prompts.open) {
                      dispatch(librarySlice.actions.closeBookList());
                      dispatch(librarySlice.actions.closeChapterList());
                    }
                  }}
                  selector="prompts-button"
                >
                  <SparklesIcon className="h-5 w-5" aria-hidden="true" />
                </NavButton>

                <NavButton
                  label="Sidebar"
                  onClick={() => {
                    dispatch(librarySlice.actions.toggleSidebar());
                    if (!state.panels.sidebar.open) {
                      dispatch(librarySlice.actions.closeBookList());
                      dispatch(librarySlice.actions.closeChapterList());
                    }
                  }}
                  selector="sidebar-button"
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
            {currentChapter && <Editor onSave={onEditorSave} />}
          </div>
          {/*  we run a risk of the book id being closed and not being able to be reopened */}
        </div>
        {state.panels.prompts.open && currentChapter && (
          <div className="w-36 xl:w-48 flex-none h-screen overflow-scroll">
            <PromptsSidebar
              settings={settings}
              closeSidebar={() => dispatch(librarySlice.actions.closePrompts())}
              onLoad={() => {
                dispatch(librarySlice.actions.openSidebar());
                dispatch(librarySlice.actions.setActivePanel("suggestions"));
              }}
            />
          </div>
        )}

        {state.panels.sidebar.open && currentChapter && (
          <div className={`${sidebarWidth} flex-none h-screen overflow-scroll`}>
            <Sidebar
              settings={settings}
              setSettings={setSettings}
              activePanel={state.panels.sidebar.activePanel}
              setActivePanel={(panel) =>
                dispatch(librarySlice.actions.setActivePanel(panel))
              }
              maximize={state.viewMode === "fullscreen"}
              onSuggestionClick={addToContents}
              onSuggestionDelete={(index) => {
                dispatch(librarySlice.actions.deleteSuggestion(index));
              }}
              onSettingsSave={() => {}}
              onHistoryClick={async (newText) => {
                await onTextEditorSave(state);

                dispatch(
                  librarySlice.actions.pushTextToEditor({
                    index: 0,
                    text: newText,
                  })
                );
              }}
              triggerHistoryRerender={triggerHistoryRerender}
            />
          </div>
        )}
      </div>
    </div>
  );
}
