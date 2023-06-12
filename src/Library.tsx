import Home from "./Home";
import ChatSidebar from "./ChatSidebar";
import { ArrowUpIcon, XMarkIcon } from "@heroicons/react/24/outline";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import BookEditor from "./BookEditor";
import BookList from "./BookList";
import ChapterList from "./ChapterList";
import DiffViewer from "./DiffViewer";
import Editor from "./Editor";
import FocusMode from "./FocusMode";
import LibErrorBoundary from "./LibErrorBoundary";
import LibraryContext from "./LibraryContext";
import Nav from "./Nav";
import PromptsSidebar from "./PromptsSidebar";
import Sidebar from "./Sidebar";
import * as t from "./Types";
import LibraryLauncher from "./components/LibraryLauncher";
import Popup from "./components/Popup";
import SlideTransition from "./components/SlideTransition";
import "./globals.css";
import * as fd from "./lib/fetchData";
import { useColors, useKeyDown } from "./lib/hooks";
import LoadingPlaceholder, {
  EditorPlaceholder,
  PanelPlaceholder,
} from "./LoadingPlaceholder";
import {
  defaultSettings,
  fetchBooksThunk,
  getChapter,
  getCompostBookId,
  getSelectedBook,
  getSelectedChapter,
  librarySlice,
} from "./reducers/librarySlice";
import { AppDispatch, RootState } from "./store";
import {
  getCsrfToken,
  saveTextToHistory,
  today,
  uniq,
  useInterval,
  useLocalStorage,
} from "./utils";
import BlocksSidebar from "./BlocksSidebar";
import OutlineSidebar from "./OutlineSidebar";
import FocusSidebar from "./FocusSidebar";
import Tabs from "./Tabs";
import EditHistorySidebar from "./EditHistorySidebar";
import DebugSidebar from "./DebugSidebar";
import Help from "./Help";
import SearchSidebar from "./SearchSidebar";

export default function Library({ mobile = false }) {
  const state: t.State = useSelector((state: RootState) => state.library);
  const currentChapter = getSelectedChapter({ library: state });
  const compostBookId = useSelector(getCompostBookId);
  const editor = useSelector((state: RootState) => state.library.editor);
  const viewMode = useSelector((state: RootState) => state.library.viewMode);
  const activeTab = useSelector((state: RootState) => state.library.activeTab);
  const openTabs = useSelector((state: RootState) => state.library.openTabs);
  const currentText = currentChapter?.text || [];

  const dispatch = useDispatch<AppDispatch>();
  const [settings, setSettings] = useState<t.UserSettings>(defaultSettings);
  const [usage, setUsage] = useState<t.Usage | null>(null);
  const [triggerHistoryRerender, setTriggerHistoryRerender] = useState(0);

  useEffect(() => {
    if (settings.theme === "dark" || settings.theme === "default") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings]);

  const { bookid, chapterid } = useParams();
  const [cachedBooks, setCachedBooks] = useLocalStorage<any>("cachedBooks", []);

  useEffect(() => {
    if (chapterid && state.booksLoaded) {
      dispatch(librarySlice.actions.newTab({ chapterid }));
      dispatch(librarySlice.actions.setChapter(chapterid));
      dispatch(librarySlice.actions.closeLeftSidebar());
      //dispatch(librarySlice.actions.toggleOutline());
      return;
    }
    dispatch(librarySlice.actions.setNoChapter());
  }, [chapterid, state.selectedBookId, state.booksLoaded]);

  useEffect(() => {
    if (state.booksLoaded) {
      setCachedBooks(
        state.books.map((book) => ({
          title: book.title,
          bookid: book.bookid,
          tag: book.tag,
        }))
      );
    }
  }, [state.booksLoaded]);

  useEffect(() => {
    if (bookid) {
      dispatch(librarySlice.actions.setBook(bookid));
    }
  }, [bookid]);

  useEffect(() => {
    if (activeTab === -1) {
      navigate("/");
    } else if (activeTab !== null) {
      const chapter = state.openTabs[activeTab];
      if (!chapter) {
        console.log("no chapter found.", activeTab, state.openTabs);
        navigate("/");
        return;
      }
      const activeChapterId = chapter.chapterid;
      state.books.forEach((book) => {
        book.chapters.forEach((chapter) => {
          if (chapter.chapterid === activeChapterId) {
            navigate(`/book/${book.bookid}/chapter/${chapter.chapterid}`);
          }
        });
      });
    } else {
      if (!state.selectedChapterId && state.selectedBookId) {
        navigate(`/book/${state.selectedBookId}`);
      }
    }
  }, [activeTab, openTabs]);

  // if the chapter id is null set the book list open to true
  // so that we do not end up with an empty screen.
  useEffect(() => {
    if (!chapterid) {
      dispatch(librarySlice.actions.openFileNavigator());
    }
  }, [chapterid]);

  // Force the chapter list open if a chapter has not been selected but a
  // book has.
  useEffect(() => {
    if (!chapterid && state.selectedBookId) {
      dispatch(librarySlice.actions.openFileNavigator());
    }
  }, [state.selectedBookId, chapterid]);

  useKeyDown(async (event) => {
    if (event.metaKey && event.shiftKey && event.code === "KeyS") {
      event.preventDefault();
      onTextEditorSave(state, true);
    }
    if (event.metaKey && event.code === "KeyS") {
      event.preventDefault();
      onTextEditorSave(state, false);
    } else if (event.metaKey && event.shiftKey && event.code === "KeyO") {
      event.preventDefault();
      dispatch(librarySlice.actions.toggleFileNavigator());
    } else if (event.metaKey && event.shiftKey && event.code === "KeyV") {
      event.preventDefault();
      dispatch(librarySlice.actions.toggleVersions());
    } else if (event.metaKey && event.shiftKey && event.code === "KeyT") {
      event.preventDefault();
      newChapter();
    } else if (event.metaKey && event.shiftKey && event.code === "KeyX") {
      if (!state.activeTab) return;
      const chapter = state.openTabs[state.activeTab];
      if (chapter) {
        event.preventDefault();
        dispatch(librarySlice.actions.closeTab(chapter.chapterid));
      }
    } else if (event.metaKey && event.code === "BracketLeft") {
      event.preventDefault();
      dispatch(librarySlice.actions.prevTab());
    } else if (event.metaKey && event.code === "BracketRight") {
      event.preventDefault();
      dispatch(librarySlice.actions.nextTab());
    } else if (event.key === "Escape") {
      event.preventDefault();
      if (state.popupOpen) {
        dispatch(librarySlice.actions.hidePopup());
      } else if (state.launcherOpen) {
        dispatch(librarySlice.actions.toggleLauncher());
        /* } else if (state.viewMode === "focus") {
        focusModeClose();
       */
      } else if (state.viewMode !== "default") {
        dispatch(librarySlice.actions.setViewMode("default"));
      } else if (
        state.panels.leftSidebar.open ||
        state.panels.rightSidebar.open
      ) {
        dispatch(librarySlice.actions.closeAllPanels());
      } else {
        dispatch(librarySlice.actions.openAllPanels());
      }
    } else if (event.metaKey && event.shiftKey && event.key === "p") {
      event.preventDefault();
      dispatch(librarySlice.actions.togglePrompts());
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
    } else if (event.shiftKey && event.metaKey && event.key === "c") {
      event.preventDefault();
      dispatch(librarySlice.actions.toggleChat());
    } else if (event.shiftKey && event.metaKey && event.key === "m") {
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
      dispatch(librarySlice.actions.toggleSearch());
      /*   if (state.viewMode === "focus") {
        dispatch(librarySlice.actions.setViewMode("default"));
      } else {
        dispatch(librarySlice.actions.setViewMode("focus"));
      } */
    } else if (event.metaKey && event.key === "p") {
      event.preventDefault();
      dispatch(librarySlice.actions.toggleLauncher());
    } else if (event.shiftKey && event.metaKey && event.key === "b") {
      event.preventDefault();
      dispatch(librarySlice.actions.toggleOutline());
    } else if (event.metaKey && event.key === "b") {
      event.preventDefault();
      dispatch(librarySlice.actions.toggleBlocks());
    }
  });

  const onEditorSave = useCallback(() => onTextEditorSave(state), [state]);

  const fetchBooks = async () => {
    // @ts-ignore
    dispatch(fetchBooksThunk());
  };

  const fetchSettings = async () => {
    setLoading(true);
    const result = await fd.fetchSettings();
    setLoading(false);

    if (result.tag === "success") {
      result.payload.settings.num_suggestions = parseInt(
        result.payload.settings.num_suggestions
      );
      result.payload.settings.max_tokens = parseInt(
        result.payload.settings.max_tokens
      );

      setSettings(result.payload.settings);
      setUsage(result.payload.usage);
    } else {
      dispatch(librarySlice.actions.setError(result.message));
    }
  };

  const fetchBookTitles = async () => {
    if (!bookid && !chapterid) return;
    setLoading(true);
    const result = await fd.fetchBookTitles();
    setLoading(false);

    if (result.tag === "success") {
      console.log(result.payload);
      setCachedBooks(
        result.payload.books.map((book) => ({
          title: book.title,
          bookid: book.bookid,
          tag: book.tag,
        }))
      );
      /*    result.payload.settings.num_suggestions = parseInt(
        result.payload.settings.num_suggestions
      );
      result.payload.settings.max_tokens = parseInt(
        result.payload.settings.max_tokens
      );

      setSettings(result.payload.settings);
      setUsage(result.payload.usage); */
    } else {
      dispatch(librarySlice.actions.setError(result.message));
    }
  };

  useEffect(() => {
    const func = async () => {
      await Promise.all([fetchBooks(), fetchSettings()]);
      //await Promise.all([fetchBooks(), fetchSettings(), fetchBookTitles()]);
    };
    func();
  }, []);

  const navigate = useNavigate();

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

    if (!state.settingsSaved) await saveSettings();
  }

  async function saveToHistory(state: t.State) {
    if (!currentChapter) return;
    await makeApiCall(fd.saveToHistory, [
      currentChapter.chapterid,
      saveTextToHistory(currentChapter),
    ]);
  }

  async function makeApiCall(func, args) {
    dispatch(librarySlice.actions.loading());
    const result = await func(...args);
    dispatch(librarySlice.actions.loaded());
    if (result.tag === "error") {
      dispatch(librarySlice.actions.setError(result.message));
    } else {
      dispatch(librarySlice.actions.clearError());
    }
    return result;
  }

  async function newChapter(
    title = "New Chapter",
    text = "",
    _bookid: string | null = null
  ) {
    const theBookid = _bookid || bookid;
    const result = await makeApiCall(fd.newChapter, [theBookid, title, text]);
    if (result.tag === "success") {
      const chapter = result.payload;
      dispatch(librarySlice.actions.addChapter({ chapter, bookid: theBookid }));
      navigate(`/book/${theBookid}/chapter/${chapter.chapterid}`, {});
    }
  }

  async function newCompostNote() {
    if (compostBookId === null) return;
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

  function addToWritingStreak(chapter: t.Chapter) {
    if (!chapter.writingStreak) {
      chapter.writingStreak = [];
    } else {
      chapter.writingStreak = chapter.writingStreak.slice();
    }
    const todaysDate = today();
    const exists = chapter.writingStreak.find(
      (date) =>
        date.day === todaysDate.day &&
        date.month === todaysDate.month &&
        date.year === todaysDate.year
    );
    if (!exists) {
      chapter.writingStreak.push(todaysDate);
    }
  }

  async function saveChapter(
    _chapter: t.Chapter,
    suggestions: t.Suggestion[] | null = null
  ) {
    console.log("Saving chapter", _chapter);
    let chapter: t.Chapter = { ..._chapter };
    if (suggestions !== null) {
      chapter.suggestions = suggestions;
    }

    try {
      addToWritingStreak(chapter);
    } catch (e) {
      console.log("Error adding to writing streak", e);
    }
    try {
      const result = await makeApiCall(fd.saveChapter, [chapter]);

      if (result.tag === "success") {
        const data = result.payload;
        chapter.created_at = data.created_at;
        dispatch(librarySlice.actions.setSaved(true));
        // Since we depend on a cache version of the selected book when picking a chapter
        // we must also set the chapter on said cache whenever save occurs.
        // This avoids the issue in which switching a chapter looses your last saved work.
        dispatch(librarySlice.actions.updateChapter(chapter));
      }
    } catch (e) {
      console.log("Error saving chapter", e);
    }
  }

  async function saveSettings() {
    const _settings = { ...settings };
    _settings.customKey = null;
    console.log("Saving settings", _settings);
    await fetch("/api/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ settings: _settings, csrfToken: getCsrfToken() }),
    });
    dispatch(librarySlice.actions.setSettingsSaved(true));
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
      await saveBook(book);
    };
    func();
  }, 5000);

  useInterval(() => {
    const func = async () => {
      if (state.settingsSaved) return;
      await saveSettings();
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

  async function deleteChapter(deletedChapterid: string) {
    dispatch(librarySlice.actions.deleteChapter(deletedChapterid));
    if (deletedChapterid === chapterid) {
      dispatch(librarySlice.actions.noChapterSelected());
      navigate(`/book/${state.selectedBookId}`);
    }
  }

  async function saveBook(book: t.Book) {
    if (!book) {
      console.log("no book");
      return;
    }

    let bookNoChapters = { ...book };

    bookNoChapters.chapters = [];

    const result = await makeApiCall(fd.saveBook, [bookNoChapters]);

    if (result.tag === "success") {
      const data = result.payload;

      // We are going to update the book but not update its chapters.
      // This is because save chapter and save book both happen in the same cycle.
      // saveChapter updates the chapter in the redux store.
      // If we include the chapters here, it will overwrite the updates from saveChapter.
      bookNoChapters.created_at = data.created_at;
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

  const libraryUtils: t.LibraryContextType = {
    newChapter,
    newBook,
    newCompostNote,
    renameBook,
    renameChapter,
    saveBook,
    saveChapter,
    setLoading,
    settings,
    setSettings,
    usage,
    deleteChapter,
  };

  if (
    state.viewMode === "diff" &&
    currentText &&
    editor.activeTextIndex != currentText.length - 1
  ) {
    const originalText = currentText[editor.activeTextIndex].text;
    const newText = currentText[editor.activeTextIndex + 1].text;
    return (
      <LibraryContext.Provider value={libraryUtils}>
        <LibErrorBoundary component="diff mode">
          <DiffViewer
            originalText={originalText}
            newText={newText}
            onClose={() =>
              dispatch(librarySlice.actions.setViewMode("default"))
            }
          />
        </LibErrorBoundary>
      </LibraryContext.Provider>
    );
  }

  const fileNavigatorOpen =
    state.panels.leftSidebar.open &&
    state.panels.leftSidebar.activePanel === "filenavigator";

  const promptsOpen =
    state.panels.leftSidebar.open &&
    state.panels.leftSidebar.activePanel === "prompts";

  const blocksOpen =
    state.panels.leftSidebar.open &&
    (state.panels.leftSidebar.activePanel === "blocks" ||
      state.panels.leftSidebar.activePanel === "versions");

  const editHistoryOpen =
    state.panels.leftSidebar.open &&
    state.panels.leftSidebar.activePanel === "editHistory";

  const debugOpen =
    state.panels.leftSidebar.open &&
    state.panels.leftSidebar.activePanel === "debug";

  const searchOpen =
    state.panels.leftSidebar.open &&
    state.panels.leftSidebar.activePanel === "search";

  const outlineOpen =
    state.panels.leftSidebar.open &&
    state.panels.leftSidebar.activePanel === "outline";

  const rightSidebarOpen = !!(
    state.panels.rightSidebar.open &&
    state.panels.rightSidebar.activePanel !== "chat" &&
    state.viewMode !== "focus" &&
    currentChapter &&
    !mobile
  );

  const chatOpen = !!(
    state.panels.rightSidebar.open &&
    state.panels.rightSidebar.activePanel === "chat" &&
    state.viewMode !== "focus" &&
    currentChapter &&
    !mobile
  );

  if (state.viewMode === "fullscreen" && currentChapter) {
    return (
      <div className="w-3/4 mx-auto flex-none h-screen overflow-auto">
        <LibraryContext.Provider value={libraryUtils}>
          {state.launcherOpen && (
            <LibraryLauncher
              onEditorSave={onEditorSave}
              onLauncherClose={onLauncherClose}
            />
          )}

          <Sidebar
            onSuggestionClick={addToContents}
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
        </LibraryContext.Provider>
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      <LibraryContext.Provider value={libraryUtils}>
        {state.launcherOpen && (
          <LibErrorBoundary component="launcher">
            <LibraryLauncher
              onEditorSave={onEditorSave}
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
        {window.scrollY > 5 && (
          <div
            className={`fixed bottom-0 right-0 mr-4 mb-4 cursor-pointer text-gray-200 z-50 p-sm rounded-md active:scale-75 ${
              state.error ? "bg-red-700" : "bg-blue-700"
            }`}
            onClick={() => {
              window.scrollTo(0, 0);
            }}
          >
            <ArrowUpIcon className="w-8 h-8" />
            <p className="w-full text-center">{window.scrollY}</p>
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
          {state.helpOpen && (
            <LibErrorBoundary component="help">
              <Help />
            </LibErrorBoundary>
          )}

          {/*  nav */}
          <LibErrorBoundary component="nav">
            <Nav mobile={mobile} bookid={bookid} chapterid={chapterid} />
          </LibErrorBoundary>
          {/* <LibErrorBoundary component="tabs">
            <Tabs />
          </LibErrorBoundary> */}
          <div
            className="h-full w-full absolute top-0 left-0 bg-editor dark:bg-dmeditor z-0"
            id="editor"
          >
            <div className="h-full w-full">
              {!bookid && !currentChapter && (
                <LibErrorBoundary component="home">
                  <EditorPlaceholder loaded={state.booksLoaded}>
                    <div className="h-full w-full absolute top-0 left-96 bg-editor dark:bg-dmeditor pt-16 mb-60">
                      <Home />
                    </div>
                  </EditorPlaceholder>
                </LibErrorBoundary>
              )}
            </div>

            <div className="h-full w-full">
              {bookid && !currentChapter && (
                <LibErrorBoundary component="front matter section">
                  <EditorPlaceholder loaded={state.booksLoaded}>
                    <div className="h-full w-full absolute top-0 left-96 bg-editor dark:bg-dmeditor pt-16 mb-60">
                      <BookEditor />
                    </div>
                  </EditorPlaceholder>
                </LibErrorBoundary>
              )}
            </div>
            {currentChapter && (
              <LibErrorBoundary component="editor">
                <EditorPlaceholder loaded={state.booksLoaded}>
                  <div className="h-full w-full absolute top-0 left-0 bg-editor dark:bg-dmeditor pt-16 mb-60">
                    <Editor settings={settings} />
                  </div>
                </EditorPlaceholder>
              </LibErrorBoundary>
            )}
          </div>

          <LibErrorBoundary component="book list">
            <PanelPlaceholder
              loaded={true}
              show={state.panels.leftSidebar.open}
              className="top-0 left-0"
            >
              <SlideTransition show={fileNavigatorOpen} direction="left">
                <div
                  className={`absolute top-0 left-0 h-full w-48 z-10 mt-9`}
                  id="booklist"
                >
                  <BookList cachedBooks={cachedBooks} />
                </div>
              </SlideTransition>
            </PanelPlaceholder>
          </LibErrorBoundary>

          <LibErrorBoundary component="chapter list">
            <PanelPlaceholder
              loaded={state.booksLoaded}
              show={state.panels.leftSidebar.open}
              className={`top-0 left-48`}
            >
              <SlideTransition show={fileNavigatorOpen} direction="left">
                <div className={`absolute top-0 left-48 w-48 h-full z-10 mt-9`}>
                  <ChapterList selectedChapterId={chapterid || ""} />
                </div>
              </SlideTransition>
            </PanelPlaceholder>
          </LibErrorBoundary>

          <LibErrorBoundary component="Prompts sidebar">
            <PanelPlaceholder
              loaded={state.booksLoaded}
              show={state.panels.leftSidebar.open}
              className={` top-0 left-0`}
            >
              <SlideTransition show={promptsOpen} direction="left">
                <div
                  className={`w-48 absolute top-0 left-0 h-screen overflow-auto  mt-9`}
                >
                  <PromptsSidebar
                    closeSidebar={() =>
                      dispatch(librarySlice.actions.closePrompts())
                    }
                    onLoad={() => {
                      dispatch(librarySlice.actions.openRightSidebar());
                      dispatch(
                        librarySlice.actions.setActivePanel("suggestions")
                      );
                    }}
                  />
                </div>
              </SlideTransition>
            </PanelPlaceholder>
          </LibErrorBoundary>

          <LibErrorBoundary component="Blocks sidebar">
            <PanelPlaceholder
              loaded={state.booksLoaded}
              show={state.panels.leftSidebar.open}
              className={` top-0 left-0`}
            >
              <SlideTransition show={blocksOpen} direction="left">
                <div
                  className={`w-48 absolute top-0 left-0 h-screen overflow-auto mt-9`}
                >
                  <BlocksSidebar />
                </div>
              </SlideTransition>
            </PanelPlaceholder>
          </LibErrorBoundary>

          <LibErrorBoundary component="Edit history sidebar">
            <PanelPlaceholder
              loaded={state.booksLoaded}
              show={state.panels.leftSidebar.open}
              className={` top-0 left-0`}
            >
              <SlideTransition show={editHistoryOpen} direction="left">
                <div
                  className={`w-48 absolute top-0 left-0 h-screen overflow-auto mt-9`}
                >
                  <EditHistorySidebar />
                </div>
              </SlideTransition>
            </PanelPlaceholder>
          </LibErrorBoundary>

          <LibErrorBoundary component="Debug sidebar">
            <PanelPlaceholder
              loaded={state.booksLoaded}
              show={state.panels.leftSidebar.open}
              className={` top-0 left-0`}
            >
              <SlideTransition show={debugOpen} direction="left">
                <div
                  className={`w-1/2 absolute top-0 left-0 h-screen overflow-auto mt-9`}
                >
                  <DebugSidebar />
                </div>
              </SlideTransition>
            </PanelPlaceholder>
          </LibErrorBoundary>

          <LibErrorBoundary component="Search sidebar">
            <PanelPlaceholder
              loaded={state.booksLoaded}
              show={state.panels.leftSidebar.open}
              className={` top-0 left-0`}
            >
              <SlideTransition show={searchOpen} direction="left">
                <div
                  className={`w-96 absolute top-0 left-0 h-screen overflow-auto mt-9`}
                >
                  <SearchSidebar />
                </div>
              </SlideTransition>
            </PanelPlaceholder>
          </LibErrorBoundary>

          <LibErrorBoundary component="Outline sidebar">
            <PanelPlaceholder
              loaded={state.booksLoaded}
              show={state.panels.leftSidebar.open}
              className={` top-0 left-0`}
            >
              <SlideTransition show={outlineOpen} direction="left">
                <div
                  className={`w-72 absolute top-0 left-0 h-screen overflow-auto mt-9`}
                >
                  <OutlineSidebar />
                </div>
              </SlideTransition>
            </PanelPlaceholder>
          </LibErrorBoundary>

          <LibErrorBoundary component="sidebar">
            <PanelPlaceholder
              loaded={state.booksLoaded}
              show={state.panels.rightSidebar.open}
              className="top-0 right-0"
            >
              <SlideTransition show={rightSidebarOpen} direction="right">
                <div
                  className={`absolute top-0 right-0 h-screen w-48 2xl:w-72 mt-9 z-10`}
                >
                  <Sidebar
                    onSuggestionClick={addToContents}
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
              </SlideTransition>
            </PanelPlaceholder>
          </LibErrorBoundary>

          <LibErrorBoundary component="chat">
            <PanelPlaceholder
              loaded={state.booksLoaded}
              show={state.panels.rightSidebar.open}
              className="top-0 right-0"
            >
              <SlideTransition show={chatOpen} direction="right">
                <div className={`absolute top-0 right-0 h-screen w-96 mt-9`}>
                  <ChatSidebar />
                </div>
              </SlideTransition>
            </PanelPlaceholder>
          </LibErrorBoundary>

          <LibErrorBoundary component="focus sidebar">
            <PanelPlaceholder
              loaded={state.booksLoaded}
              show={state.viewMode === "focus"}
              className="top-0 right-0"
            >
              <SlideTransition
                show={state.viewMode === "focus"}
                direction="right"
              >
                <div className={`absolute top-0 right-0 h-screen w-72 mt-9`}>
                  <FocusSidebar />
                </div>
              </SlideTransition>
            </PanelPlaceholder>
          </LibErrorBoundary>
        </div>
      </LibraryContext.Provider>
    </div>
  );
}
