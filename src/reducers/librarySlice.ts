import * as toolkitRaw from "@reduxjs/toolkit";
import type { AsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import * as t from "../Types";
import {
  isString, getCsrfToken, localStorageOrDefault, parseText,
} from "../utils";

import { RootState } from "../store";

// @ts-ignore
const { createSlice, createAsyncThunk } = toolkitRaw.default ?? toolkitRaw;

type DefaultChapter = {
  title: string;
  text: t.TextBlock[];
  chapterid: string;
  suggestions: string[];
};

const defaults = {
  title: "",
  text: [t.plainTextBlock("default textt")],
  chapterid: "",
  suggestions: [],
};

const initialEditorState = (
  _chapter: t.Chapter | DefaultChapter,
): t.EditorState => {
  const chapter = _chapter || defaults;
  return {
    contents: {},
    selectedText: { index: 0, length: 0, contents: "" },
  };
};

export const initialState = (_chapter: t.Chapter | null): t.LibraryState => {
  const chapter = _chapter || defaults;
  return {
    books: [],
    selectedBookId: null,
    editor: initialEditorState(chapter),
    selectedChapterId: chapter.chapterid,
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
    booksLoaded: false,
    viewMode: "default",
    launcherOpen: false,
    historyRerender: 0,
  };
};

export const saveFromTextEditorThunk: AsyncThunk<null, null, RootState> = createAsyncThunk('library/saveFromEditor', async (payload, thunkAPI) => {
  thunkAPI.dispatch(saveCurrentChapterThunk());
  thunkAPI.dispatch(saveBookThunk(getSelectedBook(thunkAPI.getState())));
  thunkAPI.dispatch(saveToHistoryThunk());
});

export const saveCurrentChapterThunk: AsyncThunk<null, null, RootState> = createAsyncThunk('library/saveCurrentChapter', async (_payload, thunkAPI) => {
  const { chapter, suggestions } = thunkAPI.getState().library;
  const chapterToSave = thunkAPI.dispatch(saveChapterThunk({ chapter, suggestions }));

  // Since we depend on a cache version of the selected book when picking a chapter
  // we must also set the chapter on said cache whenever save occurs.
  // This avoids the issue in which switching a chapter looses your last saved work.
  thunkAPI.dispatch(librarySlice.actions.setSelectedBookChapter(chapterToSave));
});

export const saveChapterThunk: AsyncThunk<t.Chapter, { chapter: t.Chapter, suggestions: t.Suggestion[] }, RootState> = createAsyncThunk('library/saveChapter', async (payload, thunkAPI) => {
  const chapterToSave = { ...payload.chapter };
  chapterToSave.suggestions = payload.suggestions;
  const body = JSON.stringify({ chapter: chapterToSave, csrfToken: getCsrfToken() });
  await fetch("/api/saveChapter", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: thunkAPI.signal,
    body,
  });

  return chapterToSave;
});

export const saveBookThunk: AsyncThunk<null, t.Book, RootState> = createAsyncThunk('library/saveBook', async (book, thunkAPI) => {
  if (!book) {
    return;
  }

  const body = JSON.stringify({ book, csrfToken: getCsrfToken() });
  await fetch("/api/saveBook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: thunkAPI.signal,
    body,
  });
});

export const saveToHistoryThunk: AsyncThunk<null, null, RootState> = createAsyncThunk('library/saveToHistory', async (_payload, thunkAPI) => {
  const { chapter } = thunkAPI.getState().library;
  const body = JSON.stringify({
    chapterid: chapter.chapterid,
    text: chapter.text.map((t) => t.text).join("\n"),
    csrfToken: getCsrfToken(),
  });

  await fetch("/api/saveToHistory", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: thunkAPI.signal,
    credentials: "include",
    body,
  });

  thunkAPI.dispatch(librarySlice.actions.updateHistoryRerender());
});

export const librarySlice = createSlice({
  name: "library",
  initialState: initialState(null),
  reducers: {
    setBooks(state: t.LibraryState, action: PayloadAction<t.Book[]>) {
      const books = action.payload;
      books.forEach((book) => {
        book.chapters.forEach((chapter) => {
          if (isString(chapter.text)) chapter.text = [t.plainTextBlock(chapter.text)];
        });
      });
      state.books = action.payload;
    },
    setBooksLoaded(state: t.LibraryState, action: PayloadAction<boolean>) {
      state.booksLoaded = action.payload;
    },
    addBook(state: t.LibraryState, action: PayloadAction<t.Book>) {
      state.books.push(action.payload);
    },
    setBook(state: t.LibraryState, action: PayloadAction<string | null>) {
      state.selectedBookId = action.payload;
    },
    deleteBook(state: t.LibraryState, action: PayloadAction<string>) {
      const bookid = action.payload;
      state.books = state.books.filter((book) => book.bookid !== bookid);
    },
    deleteChapter(state: t.LibraryState, action: PayloadAction<string>) {
      const chapterid = action.payload;
      const book = getSelectedBook({ library: state });
      book.chapters = book.chapters.filter(
        (chapter) => chapter.chapterid !== chapterid,
      );
    },
    addChapter(state: t.LibraryState, action: PayloadAction<t.Chapter>) {
      const chapter = action.payload;
      const book = getSelectedBook({ library: state });
      book.chapters.push(chapter);
    },
    setChapter(state: t.LibraryState, action: PayloadAction<string>) {
      const chapterId = action.payload;
      const chapter = getChapter(chapterId)({ library: state });
      if (!chapter) return;
      state.editor = initialEditorState(chapter);
      state.selectedChapterId = chapterId;
      state.suggestions = chapter.suggestions;
    },
    setNoChapter(state) {
      state.editor = initialEditorState(null);
      state.selectedChapterId = null;
      state.suggestions = [];
    },
    setError(state: t.LibraryState, action: PayloadAction<string>) {
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
    setText(state: t.LibraryState, action: PayloadAction<t.NewTextForBlock>) {
      const { index, text } = action.payload;

      const chapter = getSelectedChapter({ library: state });
      chapter.text[index].text = text;
      state.saved = false;
    },
    pushTextToEditor(state: t.LibraryState, action: PayloadAction<t.NewTextForBlock>) {
      const { index, text } = action.payload;
      state.editor._pushTextToEditor = text;
      const chapter = getSelectedChapter({ library: state });
      chapter.text[index].text = text;

      state.saved = false;
    },
    setTitle(state: t.LibraryState, action) {
      const chapter = getSelectedChapter({ library: state });
      chapter.title = action.payload;

      state.saved = false;
    },
    setSuggestions(state: t.LibraryState, action: PayloadAction<t.Suggestion[]>) {
      if (action.payload) {
        state.suggestions = action.payload;
        state.saved = false;
      }
    },
    setSaved(state: t.LibraryState, action: PayloadAction<boolean>) {
      state.saved = action.payload;
    },
    setSelectedBookChapter(state: t.LibraryState, action: PayloadAction<t.Chapter>) {
      const _chapter = action.payload;
      const book = getSelectedBook({ library: state });
      const idx = book.chapters.findIndex(
        (sbChapter) => sbChapter.chapterid === _chapter.chapterid,
      );

      if (idx >= 0) {
        book.chapters[idx] = _chapter;
      }
    },
    addToContents(state: t.LibraryState, action: PayloadAction<string>) {
      state.editor._pushContentToEditor = action.payload;
      state.saved = false;
    },
    setSelectedText(state: t.LibraryState, action: PayloadAction<t.SelectedText>) {
      state.editor.selectedText = action.payload;
    },
    clearSelectedText(state) {
      state.editor._cachedSelectedText = state.editor.selectedText;
      state.editor.selectedText = { index: 0, length: 0, contents: "" };
    },
    addSuggestion(
      state: t.LibraryState,
      action: PayloadAction<{ label: string; value: string }>,
    ) {
      state.suggestions.push({
        type: action.payload.label,
        contents: action.payload.value,
      });
      state.saved = false;
    },
    deleteSuggestion(state: t.LibraryState, action: PayloadAction<number>) {
      state.suggestions.splice(action.payload, 1);
      state.saved = false;
    },
    setChapterOrder(state: t.LibraryState, action: PayloadAction<t.ChapterId[]>) {
      const ids = action.payload;

      const book = getSelectedBook({ library: state });
      book.chapterOrder = ids;
      state.saved = false;
    },
    setTemporaryFocusModeState(state: t.LibraryState, action: PayloadAction<string>) {
      state._temporaryFocusModeState = action.payload;
    },
    setViewMode(state: t.LibraryState, action: PayloadAction<t.ViewMode>) {
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
    setActivePanel(state: t.LibraryState, action: PayloadAction<string>) {
      state.panels.sidebar.activePanel = action.payload;
      localStorage.setItem("activePanel", action.payload);
    },
    toggleLauncher(state) {
      state.launcherOpen = !state.launcherOpen;
    },
    noBookSelected(state) {
      state.selectedBookId = null;
      state.selectedChapterId = null;
    },
    noChapterSelected(state) {
      state.selectedChapterId = null;
    },
    updateHistoryRerender(state: t.LibraryState) {
      state.historyRerender += 1;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(saveFromTextEditorThunk.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(saveFromTextEditorThunk.fulfilled, (state) => {
      state.loading = false;
      state.loaded = true;
    });

    builder.addCase(saveFromTextEditorThunk.rejected, (state) => {
      state.loading = false;
      state.loaded = true;
      // TODO add errors here
    });
  },
});

export const getChapterTitles = (bookid) => (state: RootState) => {
  const book = state.library.books.find((book) => book.bookid === bookid);
  if (book) {
    return book.chapters.map((chapter) => chapter.title);
  }
  return [];
};

export const getChapters = (bookid) => (state: RootState) => {
  const book = state.library.books.find((book) => book.bookid === bookid);
  if (book) {
    return book.chapters;
  }
  return [];
};

export const getSelectedBook = (state: RootState): t.Book | null => {
  if (!state.library.booksLoaded) return null;

  const book = state.library.books.find(
    (book) => book.bookid === state.library.selectedBookId,
  );

  return book;
};

export const getSelectedChapter = (state: RootState): t.Chapter | null => {
  if (!state.library.booksLoaded) return null;

  const book = getSelectedBook(state);
  if (!book) return null;
  const chapter = book.chapters.find(
    (chapter) => chapter.chapterid === state.library.selectedChapterId,
  );

  return chapter;
};

export const getChapter = (chapterid: t.ChapterId) => (state: RootState): t.Chapter | null => {
  if (!state.library.booksLoaded) return null;
  let chapterToReturn = null;
  state.library.books.forEach((book) => {
    book.chapters.forEach((chapter) => {
      if (chapter.chapterid === chapterid) {
        chapterToReturn = chapter;
      }
    });
  });

  return chapterToReturn;
};

export const getSelectedBookChapters = (
  state: RootState,
): t.Chapter[] | null => {
  const book = getSelectedBook(state);

  if (!book) return null;

  const { chapters } = book;
  if (book.chapterOrder.length > 0) {
    const sortedChapters = [];
    book.chapterOrder.forEach((id) => {
      const chapter = chapters.find((chapter) => chapter.chapterid === id);
      if (chapter) sortedChapters.push(chapter);
    });
    return sortedChapters;
  }
  return chapters;
};
