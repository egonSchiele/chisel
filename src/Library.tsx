import { XMarkIcon } from "@heroicons/react/24/outline";
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
import { useKeyDown } from "./lib/hooks";
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
import { saveTextToHistory, useInterval } from "./utils";

export default function Library({ mobile = false }) {
  const state: t.State = useSelector((state: RootState) => state.library);
  const currentChapter = getSelectedChapter({ library: state });
  const compostBookId = useSelector(getCompostBookId);
  const editor = useSelector((state: RootState) => state.library.editor);
  const viewMode = useSelector((state: RootState) => state.library.viewMode);
  const currentText = currentChapter?.text || [];

  const dispatch = useDispatch<AppDispatch>();
  const [settings, setSettings] = useState<t.UserSettings>(defaultSettings);
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

  useKeyDown(async (event) => {
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
  });

  const onEditorSave = useCallback(() => onTextEditorSave(state), [state]);

  const fetchBooks = async () => {
    dispatch(fetchBooksThunk(null));
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

  async function saveChapter(
    _chapter: t.Chapter,
    suggestions: t.Suggestion[] | null = null
  ) {
    let chapter: t.Chapter = { ..._chapter };
    if (suggestions !== null) {
      chapter.suggestions = suggestions;
    }

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
    usage,
    deleteChapter,
  };

  if (!state.booksLoaded) {
    return (
      <div className="flex h-screen w-screen ">
        {/*         <div className="bg-sidebar dark:bg-dmsidebar border-r border-gray-700 w-48 h-screen"></div>
        <div className="bg-sidebarSecondary dark:bg-dmsidebarSecondary border-r border-gray-700 w-48 h-screen" />
 */}{" "}
        <div className="flex-grow h-screen mx-16 my-16 text-md uppercase">
          Loading...
        </div>
      </div>
    );
  }

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
          <Nav mobile={mobile} bookid={bookid} chapterid={chapterid} />
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
                <BookList />
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
                <ChapterList selectedChapterId={chapterid || ""} />
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
                    dispatch(
                      librarySlice.actions.setActivePanel("suggestions")
                    );
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
      </LibraryContext.Provider>
    </div>
  );
}
