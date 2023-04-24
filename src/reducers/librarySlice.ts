import * as toolkitRaw from "@reduxjs/toolkit";
import type { AsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import * as t from "../Types";
import {
  isString,
  localStorageOrDefault,
  parseText,
  strSplice,
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
    activeTextIndex: 0,
    selectedText: { index: 0, length: 0, contents: "" },
  };
};

export const initialState = (_chapter: t.Chapter | null): t.State => {
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
  };
};

export const fetchBooksThunk: AsyncThunk<void, null, RootState> = createAsyncThunk(
  "library/fetchBooks",
  async (_payload, { dispatch, signal }) => {
    const res = await fetch(`/books`, {
      credentials: "include",
      signal,
    });

    const { books } = await res.json();
    dispatch(librarySlice.actions.setBooks(books));
  },
);

export const librarySlice = createSlice({
  name: "library",
  initialState: initialState(null) as t.State,
  reducers: {
    setBooks(state: t.State, action: PayloadAction<t.Book[]>) {
      const books = action.payload;
      books.forEach((book) => {
        book.chapters.forEach((chapter) => {
          if (isString(chapter.text)) {
            chapter.text = [
              t.plainTextBlock(chapter.text as unknown as string),
            ];
          }
        });
      });
      state.books = action.payload;
    },
    setBooksLoaded(state: t.State, action: PayloadAction<boolean>) {
      state.booksLoaded = action.payload;
    },
    addBook(state: t.State, action: PayloadAction<t.Book>) {
      state.books.push(action.payload);
    },
    setBook(state: t.State, action: PayloadAction<string | null>) {
      state.selectedBookId = action.payload;
    },
    deleteBook(state: t.State, action: PayloadAction<string>) {
      const bookid = action.payload;
      state.books = state.books.filter((book) => book.bookid !== bookid);
    },
    deleteChapter(state: t.State, action: PayloadAction<string>) {
      const chapterid = action.payload;
      const book = getSelectedBook({ library: state });
      book.chapters = book.chapters.filter(
        (chapter) => chapter.chapterid !== chapterid,
      );
    },
    addChapter(state: t.State, action: PayloadAction<t.Chapter>) {
      const chapter = action.payload;
      const book = getSelectedBook({ library: state });
      book.chapters.push(chapter);
      book.chapterOrder.push(chapter.chapterid);
    },
    setChapter(state: t.State, action: PayloadAction<string>) {
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
    setError(state: t.State, action: PayloadAction<string>) {
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
    setText(state: t.State, action: PayloadAction<t.NewTextForBlock>) {
      const { index, text } = action.payload;

      const chapter = getSelectedChapter({ library: state });
      chapter.text[index].text = text;
      state.saved = false;
    },
    pushTextToEditor(state: t.State, action: PayloadAction<t.NewTextForBlock>) {
      const { index, text } = action.payload;
      state.editor._pushTextToEditor = text;
      const chapter = getSelectedChapter({ library: state });
      chapter.text[index].text = text;

      state.saved = false;
    },
    setTitle(state: t.State, action) {
      const chapter = getSelectedChapter({ library: state });
      chapter.title = action.payload;

      state.saved = false;
    },
    setSuggestions(state: t.State, action: PayloadAction<t.Suggestion[]>) {
      if (action.payload) {
        state.suggestions = action.payload;
        state.saved = false;
      }
    },
    setSaved(state: t.State, action: PayloadAction<boolean>) {
      state.saved = action.payload;
    },
    setSelectedBookChapter(state: t.State, action: PayloadAction<t.Chapter>) {
      const _chapter = action.payload;
      const book = getSelectedBook({ library: state });
      const idx = book.chapters.findIndex(
        (sbChapter) => sbChapter.chapterid === _chapter.chapterid,
      );

      if (idx >= 0) {
        book.chapters[idx] = _chapter;
      }
    },
    addToContents(state: t.State, action: PayloadAction<string>) {
      state.editor._pushContentToEditor = action.payload;
      state.saved = false;
    },
    setSelectedText(state: t.State, action: PayloadAction<t.SelectedText>) {
      state.editor.selectedText = action.payload;
    },
    clearSelectedText(state) {
      state.editor._cachedSelectedText = state.editor.selectedText;
      state.editor.selectedText = { index: 0, length: 0, contents: "" };
    },
    addSuggestion(
      state: t.State,
      action: PayloadAction<{ label: string; value: string }>,
    ) {
      state.suggestions.push({
        type: action.payload.label,
        contents: action.payload.value,
      });
      state.saved = false;
    },
    deleteSuggestion(state: t.State, action: PayloadAction<number>) {
      state.suggestions.splice(action.payload, 1);
      state.saved = false;
    },
    setChapterOrder(state: t.State, action: PayloadAction<t.ChapterId[]>) {
      const ids = action.payload;

      const book = getSelectedBook({ library: state });
      book.chapterOrder = ids;
      state.saved = false;
    },
    setTemporaryFocusModeState(state: t.State, action: PayloadAction<string>) {
      state._temporaryFocusModeState = action.payload;
    },
    setViewMode(state: t.State, action: PayloadAction<t.ViewMode>) {
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
    setActivePanel(state: t.State, action: PayloadAction<string>) {
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
    setActiveTextIndex(state: t.State, action: PayloadAction<number>) {
      state.editor.activeTextIndex = action.payload;
    },
    openBlock(state: t.State, action: PayloadAction<number>) {
      const chapter = getSelectedChapter({ library: state });
      chapter.text[action.payload].open = true;
      state.saved = false;
    },
    closeBlock(state: t.State, action: PayloadAction<number>) {
      const chapter = getSelectedChapter({ library: state });
      chapter.text[action.payload].open = false;
      state.saved = false;
    },
    newBlockBeforeCurrent(state: t.State) {
      const newBlock = t.plainTextBlock("");
      const chapter = getSelectedChapter({ library: state });
      chapter.text.splice(state.editor.activeTextIndex, 0, newBlock);

      state.saved = false;
    },
    newAfterBeforeCurrent(state: t.State) {
      const newBlock = t.plainTextBlock("");
      const chapter = getSelectedChapter({ library: state });
      chapter.text.splice(state.editor.activeTextIndex + 1, 0, newBlock);

      state.saved = false;
    },
    mergeBlockUp(state: t.State) {
      const index = state.editor.activeTextIndex;
      if (index === 0) return;
      const chapter = getSelectedChapter({ library: state });
      const cur = chapter.text[index];
      const prev = chapter.text[index - 1];
      prev.text += `\n${cur.text}`;
      cur.text = "deleted";
      chapter.text.splice(index, 1);

      state.saved = false;
    },
    mergeBlockDown(state: t.State) {
      const index = state.editor.activeTextIndex;
      const chapter = getSelectedChapter({ library: state });
      if (index === chapter.text.length - 1) return;
      const cur = chapter.text[index];
      const next = chapter.text[index + 1];
      cur.text += `\n${next.text}`;
      chapter.text.splice(index + 1, 1);

      state.saved = false;
    },
    extractBlock(state: t.State) {
      let { index, length, contents } = state.editor.selectedText;
      if (length === 0 && state.editor._cachedSelectedText) {
        index = state.editor._cachedSelectedText.index;
        length = state.editor._cachedSelectedText.length;
        contents = state.editor._cachedSelectedText.contents;
      }
      if (length === 0) return;
      const chapter = getSelectedChapter({ library: state });
      const text = chapter.text[state.editor.activeTextIndex];
      const newText = strSplice(text.text, index, length).trim();
      const newBlock = t.plainTextBlock(contents.trim());
      // all the text before the selection
      const startText = text.text.slice(0, index).trim();
      // all the text after the selection
      const endText = text.text.slice(index + length).trim();

      /*  console.log(
        "index",
        index,
        "length",
        length,
        "text",
        text.text,
        "newText",
        newText,
        "newBlock",
        newBlock
      ); */
      state.saved = false;
      if (index === 0) {
        if (length === text.text.length) {
          console.log("all");
          // we selected the entire text
        } else {
          console.log("start-nowhitespace");
          // we selected the beginning of the text,
          // so new block will be at the start
          text.text = newText;
          state.editor._pushTextToEditor = newText;
          chapter.text.splice(state.editor.activeTextIndex, 0, newBlock);
        }
      } else if (startText.length === 0) {
        console.log("start");
        // just whitespace the beginning of the text,
        // so new block will be at the start
        text.text = newText;
        state.editor._pushTextToEditor = newText;
        chapter.text.splice(state.editor.activeTextIndex, 0, newBlock);
      } else if (endText.length === 0) {
        console.log("end");
        // just whitespace the end of the text,
        // so new block will be at the end
        text.text = newText;
        state.editor._pushTextToEditor = newText;
        chapter.text.splice(state.editor.activeTextIndex + 1, 0, newBlock);
      } else if (index + length === text.text.length) {
        console.log("end-nowhitespace");
        // we selected the end of the text,
        // so new block will be at the end
        text.text = newText;
        state.editor._pushTextToEditor = newText;
        chapter.text.splice(state.editor.activeTextIndex + 1, 0, newBlock);
      } else {
        console.log("middle");
        // we selected the middle of the text,
        // so new block will be in the middle

        // the selected text
        chapter.text.splice(state.editor.activeTextIndex + 1, 0, newBlock);

        text.text = startText;
        state.editor._pushTextToEditor = startText;
        const endBlock = t.plainTextBlock(endText);
        chapter.text.splice(state.editor.activeTextIndex + 2, 0, endBlock);
        console.log(text.text, newBlock, endBlock);
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchBooksThunk.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchBooksThunk.fulfilled, (state) => {
      state.loading = false;
      state.booksLoaded = true;
    });

    builder.addCase(fetchBooksThunk.rejected, (state) => {
      state.loading = false;
      state.booksLoaded = true;
      state.error = "Books not found";
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

export const getSelectedChapterTitle = (state: RootState): string | null => {
  const chapter = getSelectedChapter(state);
  if (!chapter) return null;

  return chapter.title;
};

export const getSelectedChapterTextLength = (
  state: RootState,
): number | null => {
  const chapter = getSelectedChapter(state);
  if (!chapter) return null;

  return chapter.text.length;
};

export const getText = (index: number) => (state: RootState): t.TextBlock | null => {
  const chapter = getSelectedChapter(state);
  if (!chapter) return null;

  return chapter.text[index];
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
    const sortedByCreated = [...chapters];
    /*     sortedByCreated.sort((a, b) =>
      // @ts-ignore
      a.created_at - b.created_at); */
    sortedByCreated.forEach((chapter) => {
      if (!sortedChapters.includes(chapter)) sortedChapters.push(chapter);
    });
    return sortedChapters;
  }
  return chapters;
};
