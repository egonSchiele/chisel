import * as toolkitRaw from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import * as t from "../Types";
import { localStorageOrDefault } from "../utils";

// @ts-ignore
const { createSlice } = toolkitRaw.default ?? toolkitRaw;

type DefaultChapter = {
  title: string;
  text: string;
  chapterid: string;
  suggestions: string[];
};

const defaults = {
  title: "",
  text: "",
  chapterid: "",
  suggestions: [],
};

const initialEditorState = (
  _chapter: t.Chapter | DefaultChapter,
): t.EditorState => {
  const chapter = _chapter || defaults;
  return {
    title: chapter.title,
    text: chapter.text,
    contents: {},
    chapterid: chapter.chapterid,
    tooltipPosition: { top: 0, left: 0 },
    tooltipOpen: false,
    selectedText: { index: 0, length: 0, contents: "" },
  };
};

export const initialState = (_chapter: t.Chapter | null): t.State => {
  const chapter = _chapter || defaults;
  return {
    books: [],
    selectedBook: null,
    editor: initialEditorState(chapter),
    chapter: _chapter,
    synonyms: [],
    infoPanel: { syllables: 0 },
    panels: {
      bookList: {
        open: localStorageOrDefault("bookListOpen", true),
      },
      chapterList: {
        open: localStorageOrDefault("chapterListOpen", true),
      },
      sidebar: {
        open: localStorageOrDefault("sidebarOpen", false),
        activePanel: localStorageOrDefault("activePanel", "suggestions"),
      },
      prompts: {
        open: localStorageOrDefault("promptsOpen", false),
      },
    },
    suggestions: chapter.suggestions,
    saved: true,
    error: "",
    loading: true,
    viewMode: "default",
    launcherOpen: false,
  };
};

export const librarySlice = createSlice({
  name: "library",
  initialState: initialState(null),
  reducers: {
    setBooks(state, action: PayloadAction<t.Book[]>) {
      state.books = action.payload;
    },
    addBook(state, action: PayloadAction<t.Book>) {
      state.books.push(action.payload);
    },
    setBook(state, action: PayloadAction<t.Book>) {
      state.selectedBook = action.payload;
    },
    deleteBook(state, action: PayloadAction<string>) {
      const bookid = action.payload;
      state.books = state.books.filter((book) => book.bookid !== bookid);
    },
    deleteChapter(state, action: PayloadAction<string>) {
      const chapterid = action.payload;

      state.selectedBook.chapters = state.selectedBook.chapters.filter(
        (chapter) => chapter.chapterid !== chapterid,
      );

      state.selectedBook.chapterTitles = state.selectedBook.chapterTitles.filter(
        (chapter) => chapter.chapterid !== chapterid,
      );
    },
    setChapter(state, action) {
      const chapter = action.payload;
      state.editor = initialEditorState(chapter);
      state.chapter = chapter;
      state.suggestions = chapter.suggestions;
    },
    setNoChapter(state) {
      state.editor = initialEditorState(null);
      state.chapter = null;
      state.suggestions = [];
    },
    setError(state, action) {
      state.error = action.payload;
    },
    clearError(state) {
      state.error = "";
    },
    loading(state) {
      state.loading = true;
    },
    loaded(state) {
      state.loading = false;
    },
    setText(state, action) {
      state.editor.text = action.payload;
      state.chapter.text = action.payload;
      state.saved = false;
    },
    pushTextToEditor(state, action) {
      state.editor.text = action.payload;
      state.editor._pushTextToEditor = action.payload;
      state.chapter.text = action.payload;
      state.saved = false;
    },
    setTitle(state, action) {
      state.editor.title = action.payload;
      state.chapter.title = action.payload;
      // find chapter and then update it so that the chapter list also receives the update.
      let chapterIdx = state.selectedBook.chapters.findIndex(
        (chapter) => chapter.chapterid === state.chapter.chapterid,
      );

      if (chapterIdx !== -1) {
        state.selectedBook.chapters[chapterIdx].title = action.payload;
      }

      chapterIdx = state.selectedBook.chapterTitles.findIndex(
        (chapter) => chapter.chapterid === state.chapter.chapterid,
      );

      if (chapterIdx !== -1) {
        state.selectedBook.chapterTitles[chapterIdx].title = action.payload;
      }
      state.saved = false;
    },
    setSuggestions(state, action) {
      if (action.payload) {
        state.suggestions = action.payload;
        state.saved = false;
      }
    },
    setSaved(state, action) {
      state.saved = action.payload;
    },
    setSelectedBookChapter(state, action) {
      const _chapter = action.payload;
      const idx = state.selectedBook.chapters.findIndex(
        (sbChapter) => sbChapter.chapterid === _chapter.chapterid,
      );

      if (idx >= 0) {
        state.selectedBook.chapters[idx] = _chapter;
      }
    },
    addToContents(state, action) {
      state.editor._pushContentToEditor = action.payload;
      state.editor.text += action.payload;
      state.saved = false;
    },
    setSelectedText(state, action) {
      state.editor.selectedText = action.payload;
    },
    clearSelectedText(state) {
      state.editor._cachedSelectedText = state.editor.selectedText;
      state.editor.selectedText = { index: 0, length: 0, contents: "" };
      console.log(
        "clearing selected text",
        state.editor._cachedSelectedText,
        state.editor.selectedText,
      );
    },
    addSuggestion(state, action) {
      state.suggestions.push({
        type: action.payload.label,
        contents: action.payload.value,
      });
      state.saved = false;
    },
    deleteSuggestion(state, action) {
      state.suggestions.splice(action.payload, 1);
      state.saved = false;
    },
    setChapterOrder(state, action) {
      const { ids } = action.payload;
      console.log(ids);
      const newTitles = [];
      ids.forEach((id) => {
        const chapter = state.selectedBook.chapterTitles.find(
          (chapter) => chapter.chapterid === id,
        );
        if (chapter) {
          newTitles.push(chapter);
        }
      });
      state.selectedBook.chapterTitles = newTitles;
      state.saved = false;
    },
    setTemporaryFocusModeState(state, action) {
      state._temporaryFocusModeState = action.payload;
    },
    setViewMode(state, action) {
      state.viewMode = action.payload;
    },
    openBookList(state) {
      state.panels.bookList.open = true;
      localStorage.setItem("bookListOpen", "true");
    },
    closeBookList(state) {
      state.panels.bookList.open = false;
      localStorage.setItem("bookListOpen", "false");
    },
    openChapterList(state) {
      state.panels.chapterList.open = true;
      localStorage.setItem("chapterListOpen", "true");
    },
    closeChapterList(state) {
      state.panels.chapterList.open = false;
      localStorage.setItem("chapterListOpen", "false");
    },
    openSidebar(state) {
      state.panels.sidebar.open = true;
      localStorage.setItem("sidebarOpen", "true");
    },
    closeSidebar(state) {
      state.panels.sidebar.open = false;
      localStorage.setItem("sidebarOpen", "false");
    },
    closePrompts(state) {
      state.panels.prompts.open = false;
      localStorage.setItem("promptsOpen", "false");
    },
    toggleBookList(state) {
      state.panels.bookList.open = !state.panels.bookList.open;
      localStorage.setItem(
        "bookListOpen",
        state.panels.bookList.open ? "true" : "false",
      );
    },
    toggleChapterList(state) {
      state.panels.chapterList.open = !state.panels.chapterList.open;
      localStorage.setItem(
        "chapterListOpen",
        state.panels.chapterList.open ? "true" : "false",
      );
    },
    toggleSidebar(state) {
      state.panels.sidebar.open = !state.panels.sidebar.open;
      localStorage.setItem(
        "sidebarOpen",
        state.panels.sidebar.open ? "true" : "false",
      );
    },
    togglePrompts(state) {
      state.panels.prompts.open = !state.panels.prompts.open;
      localStorage.setItem(
        "promptsOpen",
        state.panels.prompts.open ? "true" : "false",
      );
    },
    closeAllPanels(state) {
      state.panels.bookList.open = false;
      state.panels.chapterList.open = false;
      state.panels.sidebar.open = false;
      state.panels.prompts.open = false;
      localStorage.setItem("bookListOpen", "false");
      localStorage.setItem("chapterListOpen", "false");
      localStorage.setItem("sidebarOpen", "false");
      localStorage.setItem("promptsOpen", "false");
    },
    openAllPanels(state) {
      state.panels.bookList.open = true;
      state.panels.chapterList.open = true;
      state.panels.sidebar.open = true;
      state.panels.prompts.open = true;
      localStorage.setItem("bookListOpen", "true");
      localStorage.setItem("chapterListOpen", "true");
      localStorage.setItem("sidebarOpen", "true");
      localStorage.setItem("promptsOpen", "true");
    },
    setActivePanel(state, action) {
      state.panels.sidebar.activePanel = action.payload;
      localStorage.setItem("activePanel", action.payload);
    },
    toggleLauncher(state) {
      state.launcherOpen = !state.launcherOpen;
    },
    noBookSelected(state) {
      state.selectedBook = null;
      state.chapter = null;
    },
    noChapterSelected(state) {
      state.chapter = null;
    },
  },
});

export const getChapterTitles = (bookid) => (state) => {
  const book = state.books.find((book) => book.bookid === bookid);
  if (book) {
    return book.chapters.map((chapter) => chapter.title);
  }
  return [];
};
