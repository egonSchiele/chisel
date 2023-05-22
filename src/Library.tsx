import { Transition } from "@headlessui/react";
import LibErrorBoundary from "./LibErrorBoundary";
import React, { Reducer, useCallback, useEffect, useState } from "react";
import * as t from "./Types";
import "./globals.css";

import BookList from "./BookList";
import { useNavigate, useParams } from "react-router-dom";
import ChapterList from "./ChapterList";
import Editor from "./Editor";
import * as fd from "./lib/fetchData";
import {
  getChapterText,
  getCsrfToken,
  isTruthy,
  saveTextToHistory,
  useInterval,
} from "./utils";
import Launcher from "./Launcher";
import {
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalCircleIcon,
  EyeIcon,
  MinusIcon,
  PencilIcon,
  ScissorsIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import PromptsSidebar from "./PromptsSidebar";
import Sidebar from "./Sidebar";
import NavButton from "./components/NavButton";
import Spinner from "./components/Spinner";
import FocusMode from "./FocusMode";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./store";
import {
  fetchBooksThunk,
  getChapter,
  getSelectedBook,
  getSelectedChapter,
  librarySlice,
} from "./reducers/librarySlice";
import DiffViewer from "./DiffViewer";
import BookEditor from "./BookEditor";
import Popup from "./components/Popup";
import LibraryLauncher from "./components/LibraryLauncher";
import SlideTransition from "./components/SlideTransition";

export default function Library({ mobile = false }) {
  const state: t.State = useSelector((state: RootState) => state.library);
  const selectedBook = useSelector(getSelectedBook);

  const currentChapter = getSelectedChapter({ library: state });
  const compostBookId = useSelector((state: RootState) => {
    const compostBook = state.library.books.find(
      (b: t.Book) => b.tag === "compost"
    );
    if (compostBook) {
      return compostBook.bookid;
    }
    return null;
  });
  const dispatch = useDispatch<AppDispatch>();
  const [settings, setSettings] = useState<t.UserSettings>({
    model: "",
    max_tokens: 0,
    num_suggestions: 0,
    theme: "default",
    version_control: false,
    prompts: [],
    design: null,
  });
  const [usage, setUsage] = useState<t.Usage | null>(null);

  const [triggerHistoryRerender, setTriggerHistoryRerender] = useState(0);

  const { bookid, chapterid } = useParams();

  useEffect(() => {
    if (chapterid && state.booksLoaded) {
      dispatch(librarySlice.actions.setChapter(chapterid));
      return;
    }
    dispatch(librarySlice.actions.setNoChapter());
  }, [chapterid, state.selectedBookId, state.booksLoaded]);

  const handleKeyDown = async (event) => {
    if (event.metaKey && event.shiftKey && event.code === "KeyS") {
      event.preventDefault();
      onTextEditorSave(state, true);
    }
    if (event.metaKey && event.code === "KeyS") {
      event.preventDefault();
      onTextEditorSave(state, false);
    } else if (event.key === "Escape") {
      event.preventDefault();
      if (state.popupOpen) {
        dispatch(librarySlice.actions.hidePopup());
      } else if (state.launcherOpen) {
        dispatch(librarySlice.actions.toggleLauncher());
      } else if (state.viewMode === "focus") {
        focusModeClose();
      } else if (state.viewMode !== "default") {
        dispatch(librarySlice.actions.setViewMode("default"));
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
    } else if (event.metaKey && event.shiftKey && event.key === "d") {
      event.preventDefault();
      if (state.viewMode === "diff") {
        dispatch(librarySlice.actions.setViewMode("default"));
        return;
      }
      if (
        viewMode !== "diff" &&
        editor.activeTextIndex !== currentText.length - 1
      ) {
        dispatch(librarySlice.actions.setViewMode("diff"));
      }
    } else if (event.altKey && event.key === "n") {
      event.preventDefault();
      await newChapter();
    } else if (event.shiftKey && event.metaKey && event.key === "c") {
      event.preventDefault();
      await newCompostNote();
    } else if (event.shiftKey && event.metaKey && event.key === "r") {
      event.preventDefault();
      if (state.viewMode === "readonly") {
        dispatch(librarySlice.actions.setViewMode("default"));
      } else {
        dispatch(librarySlice.actions.setViewMode("readonly"));
        dispatch(librarySlice.actions.closeAllPanels());
      }
    } else if (event.shiftKey && event.metaKey && event.key === "f") {
      event.preventDefault();
      if (state.viewMode === "focus") {
        dispatch(librarySlice.actions.setViewMode("default"));
      } else {
        dispatch(librarySlice.actions.setViewMode("focus"));
      }
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

  const panels = useSelector((state: RootState) => state.library.panels);
  const books = useSelector((state: RootState) => state.library.books);
  const editor = useSelector((state: RootState) => state.library.editor);
  const viewMode = useSelector((state: RootState) => state.library.viewMode);
  const currentText = useSelector((state: RootState) => {
    const chapter = getSelectedChapter(state);
    return chapter ? chapter.text : [];
  });

  const currentChapterTitle = useSelector((state: RootState) => {
    const chapter = getSelectedChapter(state);
    return chapter ? chapter.title : "";
  });

  const currentBookTitle = useSelector((state: RootState) => {
    const book = getSelectedBook(state);
    return book ? book.title : "";
  });

  const onEditorSave = useCallback(() => onTextEditorSave(state), [state]);

  const fetchBooks = async () => {
    dispatch(fetchBooksThunk());
  };

  const fetchSettings = async () => {
    setLoading(true);
    const result = await fd.fetchSettings();
    setLoading(false);

    if (result.tag === "success") {
      setSettings(result.payload.settings);
      setUsage(result.payload.usage);
    } else {
      dispatch(librarySlice.actions.setError(result.message));
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchSettings();
  }, []);

  const navigate = useNavigate();

  function onSuggestionLoad() {
    dispatch(librarySlice.actions.openSidebar());
    dispatch(librarySlice.actions.setActivePanel("suggestions"));
  }

  const onLauncherClose = useCallback(
    () => dispatch(librarySlice.actions.toggleLauncher()),
    []
  );

  async function onTextEditorSave(state: t.State, shouldSaveToHistory = false) {
    const chapter = getSelectedChapter({ library: state });
    if (!chapter) {
      console.log("No chapter to save");
    } else {
      await saveChapter(chapter, state.suggestions);
    }
    const book = getSelectedBook({ library: state });
    if (!book) {
      console.log("No book to save");
    } else {
      try {
        await saveBook(book);
      } catch (e) {
        console.log("Error saving book", e);
        dispatch(librarySlice.actions.setError(e.message));
      }
    }

    if (chapter && shouldSaveToHistory) {
      await saveToHistory(state);
      setTriggerHistoryRerender((t) => t + 1);
    }
  }

  async function saveToHistory(state: t.State) {
    const body = JSON.stringify({
      chapterid: currentChapter.chapterid,
      text: saveTextToHistory(currentChapter),
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

  async function newChapter(title = "New Chapter", text = "", _bookid = null) {
    const theBookid = _bookid || bookid;
    dispatch(librarySlice.actions.loading());
    const result = await fd.newChapter(theBookid, title, text);
    dispatch(librarySlice.actions.loaded());
    if (result.tag === "error") {
      dispatch(librarySlice.actions.setError(result.message));
      return;
    }
    const chapter = result.payload;
    dispatch(librarySlice.actions.addChapter({ chapter, bookid: theBookid }));

    navigate(`/book/${theBookid}/chapter/${chapter.chapterid}`, {});
  }

  async function newCompostNote() {
    const title = new Date().toDateString();
    await newChapter(title, "", compostBookId);
  }

  async function newBook() {
    const res = await fd.newBook();
    if (res.tag === "error") {
      dispatch(librarySlice.actions.setError(res.message));
    } else {
      const book = res.payload;
      dispatch(librarySlice.actions.addBook(book));
    }
  }

  async function saveChapter(
    _chapter: t.Chapter,
    suggestions: t.Suggestion[] | null
  ) {
    let chapter: t.Chapter = { ..._chapter };
    if (suggestions !== null) {
      chapter.suggestions = suggestions;
    }
    const body = JSON.stringify({ chapter, csrfToken: getCsrfToken() });
    const result = await fetch("/api/saveChapter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    if (!result.ok || result.status !== 200) {
      const text = await result.text();

      dispatch(librarySlice.actions.setError(text));
    } else {
      const data = await result.json();
      chapter.created_at = data.created_at;

      dispatch(librarySlice.actions.clearError());
      dispatch(librarySlice.actions.setSaved(true));
      // Since we depend on a cache version of the selected book when picking a chapter
      // we must also set the chapter on said cache whenever save occurs.
      // This avoids the issue in which switching a chapter looses your last saved work.
      dispatch(librarySlice.actions.updateChapter(chapter));
    }
  }

  useInterval(() => {
    const func = async () => {
      if (state.saved) return;
      const chapter = getSelectedChapter({ library: state });
      if (chapter) {
        await saveChapter(chapter, state.suggestions);
      } else {
        console.log("No chapter to save");
      }
      const book = getSelectedBook({ library: state });

      if (!book) {
        console.log("No book to save");
        return;
      }
      try {
        await saveBook(book);
      } catch (e) {
        console.log("Error saving book", e);
        dispatch(librarySlice.actions.setError(e.message));
      }
    };
    func();
  }, 5000);

  async function renameBook(bookid: string, newTitle: string) {
    const book = state.books.find((b) => b.bookid === bookid);
    if (!book) return;
    const newBook = { ...book, title: newTitle };
    await saveBook(newBook);
  }

  async function renameChapter(chapterid: string, newTitle: string) {
    const chapter = getChapter(chapterid)({ library: state });
    if (!chapter) return;
    const newChapter = { ...chapter, title: newTitle };
    await saveChapter(newChapter, null);
  }

  async function saveBook(book: t.Book) {
    if (!book) {
      console.log("no book");
      return;
    }

    let bookNoChapters = { ...book };

    bookNoChapters.chapters = [];
    const body = JSON.stringify({
      book: bookNoChapters,
      csrfToken: getCsrfToken(),
    });
    const result = await fetch("/api/saveBook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });
    if (!result.ok || result.status !== 200) {
      const text = await result.text();

      dispatch(librarySlice.actions.setError(text));
    } else {
      const data = await result.json();

      // We are going to update the book but not update its chapters.
      // This is because save chapter and save book both happen in the same cycle.
      // saveChapter updates the chapter in the redux store.
      // If we include the chapters here, it will overwrite the updates from saveChapter.
      bookNoChapters.created_at = data.created_at;
      dispatch(librarySlice.actions.clearError());
      dispatch(librarySlice.actions.setSaved(true));
      dispatch(librarySlice.actions.updateBook(bookNoChapters));
    }
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
    return (
      <div className="flex h-screen w-screen ">
        <div className="bg-sidebar dark:bg-dmsidebar border-r border-gray-700 w-48 h-screen"></div>
        <div className="bg-sidebarSecondary dark:bg-dmsidebarSecondary border-r border-gray-700 w-48 h-screen" />
        <div className="flex-grow h-screen mx-16 my-16 text-md uppercase">
          Loading...
        </div>
      </div>
    );
  }

  const sidebarWidth = state.viewMode === "fullscreen" ? "w-96" : "w-48";

  function focusModeClose() {
    dispatch(librarySlice.actions.setViewMode("default"));

    let selected = state.editor.selectedText;
    if (
      state.editor.selectedText.contents === "" &&
      state.editor._cachedSelectedText
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
        currentText[editor.activeTextIndex].text,
        selected.index,
        selected.index + selected.length,
        state._temporaryFocusModeState
      );
    } else {
      // no selection, just replace the whole thing,
      // Because we went into focus mode with no selection
      replacement = state._temporaryFocusModeState;
    }

    if (currentText[editor.activeTextIndex].text !== replacement) {
      dispatch(
        librarySlice.actions.addVersion({
          index: editor.activeTextIndex,
          text: replacement,
          setDiffWith: true,
        })
      );
    }

    // TODO not sure how multiple texts work w focus mode
    /* dispatch(
      librarySlice.actions.pushTextToEditor({
        index: editor.activeTextIndex,
        text: replacement,
      })
    ); */
  }

  function replace(full, start, end, replacement) {
    return full.substring(0, start) + replacement + full.substring(end);
  }

  if (
    state.viewMode === "diff" &&
    currentText &&
    editor.activeTextIndex != currentText.length - 1
  ) {
    const originalText = currentText[editor.activeTextIndex].text;
    const newText = currentText[editor.activeTextIndex + 1].text;
    return (
      <LibErrorBoundary component="diff mode">
        <DiffViewer
          originalText={originalText}
          newText={newText}
          onClose={() => dispatch(librarySlice.actions.setViewMode("default"))}
        />
      </LibErrorBoundary>
    );
  }

  if (state.viewMode === "focus" && currentChapter) {
    let text = state.editor.selectedText.contents;
    if (!text && state.editor._cachedSelectedText) {
      text = state.editor._cachedSelectedText.contents;
    }
    if (!text && currentChapter && currentChapter.text) {
      text = currentText[editor.activeTextIndex].text;
    }
    return (
      <LibErrorBoundary component="focus mode">
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
      </LibErrorBoundary>
    );
  }
  const promptsOpen = !!(
    state.panels.prompts.open &&
    currentChapter &&
    !mobile
  );
  const sidebarOpen = !!(
    state.panels.sidebar.open &&
    currentChapter &&
    !mobile
  );
  const chapterListOpen = !!(
    state.panels.chapterList.open &&
    state.selectedBookId &&
    !mobile
  );

  const bookListOpen = !!(state.panels.bookList.open && !mobile);
  if (state.viewMode === "fullscreen" && currentChapter) {
    return (
      <div className="w-3/4 mx-auto flex-none h-screen overflow-auto">
        {state.launcherOpen && (
          <LibraryLauncher
            onEditorSave={onEditorSave}
            newChapter={newChapter}
            newBook={newBook}
            newCompostNote={newCompostNote}
            renameBook={renameBook}
            renameChapter={renameChapter}
            onLauncherClose={onLauncherClose}
          />
        )}

        <Sidebar
          settings={settings}
          setSettings={setSettings}
          usage={usage}
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
          onHistoryClick={async (e, newText) => {
            await onTextEditorSave(state);
            dispatch(
              librarySlice.actions.restoreFromHistory({
                text: newText,
                metaKey: e.metaKey,
              })
            );
            dispatch(librarySlice.actions.setViewMode("default"));
          }}
          addToHistory={async () => {
            await onTextEditorSave(state, true);
          }}
          triggerHistoryRerender={triggerHistoryRerender}
        />
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      {state.launcherOpen && (
        <LibErrorBoundary component="launcher">
          <LibraryLauncher
            onEditorSave={onEditorSave}
            newChapter={newChapter}
            newBook={newBook}
            newCompostNote={newCompostNote}
            renameBook={renameBook}
            renameChapter={renameChapter}
            onLauncherClose={onLauncherClose}
          />
        </LibErrorBoundary>
      )}
      {state.error && (
        <div className="bg-red-700 p-2 text-white flex">
          <p className="flex-grow">{state.error}</p>
          <div
            className="cursor-pointer flex-none"
            onClick={() => dispatch(librarySlice.actions.clearError())}
          >
            <XMarkIcon className="w-5 h-5 my-auto" />
          </div>
        </div>
      )}
      <div className="relative h-full w-full">
        {state.popupOpen && state.popupData && (
          <LibErrorBoundary component="popup">
            <Popup
              title={state.popupData.title}
              inputValue={state.popupData.inputValue}
              options={state.popupData.options}
              onSubmit={state.popupData.onSubmit}
            />
          </LibErrorBoundary>
        )}

        {/*  nav */}
        <div
          className="h-8 w-full absolute left-0 top-0 z-50 flex-grow bg-gray-800"
          id="nav"
        >
          <div className=" m-xs flex">
            <div className="flex-none">
              {(!state.panels.bookList.open ||
                !state.panels.chapterList.open) &&
                !mobile &&
                currentChapter && (
                  <NavButton
                    label="Open"
                    onClick={() => {
                      dispatch(librarySlice.actions.openBookList());
                      dispatch(librarySlice.actions.openChapterList());
                    }}
                    className="p-0"
                    selector="open-lists-button"
                  >
                    <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
                    <p className="uppercase text-xs align-baseline">Open</p>
                  </NavButton>
                )}
              {mobile && (
                <NavButton
                  label="Open"
                  onClick={() => {
                    navigate(`/book/${state.selectedBookId}`);
                  }}
                  className="p-0"
                  selector="open-lists-button"
                >
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </NavButton>
              )}

              {state.panels.bookList.open &&
                state.panels.chapterList.open &&
                !mobile &&
                currentChapter && (
                  <NavButton
                    label="Close"
                    onClick={() => {
                      dispatch(librarySlice.actions.closeBookList());
                      dispatch(librarySlice.actions.closeChapterList());
                    }}
                    className="p-0"
                    selector="close-lists-button"
                  >
                    <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
                    <p className="uppercase text-xs align-baseline">Close</p>
                  </NavButton>
                )}
            </div>

            <div className="flex-grow" />
            {bookid && !chapterid && (
              <div className="mr-sm mt-xs">
                {!state.saved && (
                  <NavButton label="Unsaved" onClick={() => {}}>
                    <MinusIcon className="h-5 w-5" aria-hidden="true" />
                  </NavButton>
                )}

                {state.saved && (
                  <NavButton label="Saved" onClick={() => {}}>
                    <CheckCircleIcon
                      className="h-5 w-5 text-blue-700 dark:text-blue-400"
                      aria-hidden="true"
                    />
                  </NavButton>
                )}
              </div>
            )}
            {chapterid && (
              <LibErrorBoundary component="navigation">
                <div className="flex-none">
                  {state.loading && (
                    <NavButton
                      label="Loading"
                      onClick={() => {}}
                      className="p-0"
                    >
                      <Spinner className="w-5 h-5" />
                    </NavButton>
                  )}

                  {state.editor.selectedText &&
                    state.editor.selectedText.length > 0 && (
                      <NavButton
                        label="Extract Block"
                        onClick={() => {
                          dispatch(librarySlice.actions.extractBlock());
                        }}
                      >
                        <ScissorsIcon className="h-5 w-5" aria-hidden="true" />
                      </NavButton>
                    )}

                  {state.viewMode === "readonly" && (
                    <span className="text-gray-300 dark:text-gray-500 text-xs uppercase mr-xs inline-block align-middle h-6">
                      read only
                    </span>
                  )}
                  {!state.saved && (
                    <NavButton label="Unsaved" onClick={() => {}}>
                      <MinusIcon className="h-5 w-5" aria-hidden="true" />
                    </NavButton>
                  )}

                  {state.saved && (
                    <NavButton label="Saved" onClick={() => {}}>
                      <CheckCircleIcon
                        className="h-5 w-5 text-blue-700 dark:text-blue-400"
                        aria-hidden="true"
                      />
                    </NavButton>
                  )}

                  {state.viewMode !== "readonly" && (
                    <NavButton
                      label="Read only"
                      onClick={() =>
                        dispatch(librarySlice.actions.setViewMode("readonly"))
                      }
                      selector="readonly-open"
                    >
                      <PencilIcon className="h-5 w-5" aria-hidden="true" />
                    </NavButton>
                  )}
                  {state.viewMode === "readonly" && (
                    <NavButton
                      label="Exit read only"
                      onClick={() =>
                        dispatch(librarySlice.actions.setViewMode("default"))
                      }
                      selector="readonly-close"
                    >
                      <PencilIcon
                        className="h-5 w-5 text-red-700"
                        aria-hidden="true"
                      />
                    </NavButton>
                  )}

                  {!mobile && (
                    <>
                      <NavButton
                        label="Focus Mode"
                        onClick={() =>
                          dispatch(librarySlice.actions.setViewMode("focus"))
                        }
                      >
                        <EyeIcon className="h-5 w-5" aria-hidden="true" />
                      </NavButton>

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
                    </>
                  )}
                </div>
              </LibErrorBoundary>
            )}
          </div>
        </div>

        <div
          className="h-full w-full absolute top-0 left-0 bg-editor dark:bg-dmeditor z-0"
          id="editor"
        >
          <div className="h-full w-full">
            {bookid && !currentChapter && (
              <LibErrorBoundary component="front matter section">
                <div className="h-full w-full absolute top-0 left-96 bg-editor dark:bg-dmeditor pt-16 mb-60">
                  <BookEditor />
                </div>
              </LibErrorBoundary>
            )}
          </div>
          {currentChapter && (
            <LibErrorBoundary component="editor">
              <div className="h-full w-full absolute top-0 left-0 bg-editor dark:bg-dmeditor pt-16 mb-60">
                <Editor settings={settings} />
              </div>
            </LibErrorBoundary>
          )}
        </div>

        <LibErrorBoundary component="book list">
          <SlideTransition show={bookListOpen} direction="left">
            <div
              className={`absolute top-0 left-0 h-full w-48 z-10 mt-8`}
              id="booklist"
            >
              <BookList
                books={state.books}
                selectedBookId={state.selectedBookId}
                onDelete={(deletedBookid) => {
                  dispatch(librarySlice.actions.deleteBook(deletedBookid));
                  if (deletedBookid === bookid) {
                    dispatch(librarySlice.actions.noBookSelected());
                    navigate("/");
                  }
                }}
                newBook={newBook}
                canCloseSidebar={false}
                saveBook={saveBook}
              />
            </div>
          </SlideTransition>
        </LibErrorBoundary>

        <LibErrorBoundary component="chapter list">
          <SlideTransition show={chapterListOpen} direction="left">
            <div
              className={`absolute top-0 ${
                bookListOpen ? "left-48" : "left-0"
              } w-48 h-full z-10 mt-8`}
            >
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
                saveChapter={(chapter) => saveChapter(chapter, null)}
                closeSidebar={() =>
                  dispatch(librarySlice.actions.closeChapterList())
                }
                newChapter={newChapter}
                canCloseSidebar={false}
              />
            </div>
          </SlideTransition>
        </LibErrorBoundary>

        <LibErrorBoundary component="Prompts sidebar">
          <SlideTransition show={!!promptsOpen} direction="right">
            <div
              className={`w-48 absolute top-0 ${
                sidebarOpen ? "right-48" : "right-0"
              } h-screen overflow-auto  mt-8`}
            >
              <PromptsSidebar
                settings={settings}
                closeSidebar={() =>
                  dispatch(librarySlice.actions.closePrompts())
                }
                onLoad={() => {
                  dispatch(librarySlice.actions.openSidebar());
                  dispatch(librarySlice.actions.setActivePanel("suggestions"));
                }}
              />
            </div>
          </SlideTransition>
        </LibErrorBoundary>

        <LibErrorBoundary component="sidebar">
          <SlideTransition show={!!sidebarOpen} direction="right">
            <div className={`absolute top-0 right-0 h-screen w-48 mt-8`}>
              <Sidebar
                settings={settings}
                setSettings={setSettings}
                usage={usage}
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
                onHistoryClick={async (e, newText) => {
                  await onTextEditorSave(state);
                  dispatch(
                    librarySlice.actions.restoreFromHistory({
                      text: newText,
                      metaKey: e.metaKey,
                    })
                  );
                  dispatch(librarySlice.actions.setViewMode("default"));
                }}
                triggerHistoryRerender={triggerHistoryRerender}
                addToHistory={async () => {
                  await onTextEditorSave(state, true);
                }}
              />
            </div>
          </SlideTransition>
        </LibErrorBoundary>
      </div>
    </div>
  );
}
