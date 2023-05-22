import { apStyleTitleCase } from "ap-style-title-case";
import * as toolkitRaw from "@reduxjs/toolkit";
import type { AsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import * as t from "../Types";
import {
  hasVersions,
  isString,
  localStorageOrDefault,
  parseText,
  restoreBlockFromHistory,
  strSplice,
} from "../utils";

import { RootState } from "../store";
import { current } from "immer";

import sortBy from "lodash/sortBy";
import { nanoid } from "nanoid";
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
  text: [t.markdownBlock("a simple default text")],
  chapterid: "",
  suggestions: [],
};

const initialEditorState = (
  _chapter: t.Chapter | DefaultChapter
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
    popupOpen: false,
    popupData: null,
  };
};

export const fetchBooksThunk: AsyncThunk<void, null, RootState> =
  createAsyncThunk(
    "library/fetchBooks",
    async (_payload, { dispatch, signal }) => {
      const res = await fetch(`/api/books`, {
        credentials: "include",
        signal,
      });

      const { books } = await res.json();
      dispatch(librarySlice.actions.setBooks(books));
    }
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
            chapter.text = parseText(chapter.text as unknown as string);
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
    updateBook(state: t.State, action: PayloadAction<t.Book>) {
      const book = action.payload;
      if (!book) return;

      state.books = state.books.map((b) => {
        if (b.bookid === book.bookid) {
          // This is because save chapter and save book both happen in the same cycle.
          // We are going to update the book but not update its chapters.
          // saveChapter updates the chapter in the redux store.
          // If we include the chapters here, it will overwrite the updates from saveChapter.

          return { ...book, chapters: b.chapters };
        }
        return b;
      });
    },
    deleteChapter(state: t.State, action: PayloadAction<string>) {
      const chapterid = action.payload;
      const book = getSelectedBook({ library: state });
      book.chapters = book.chapters.filter(
        (chapter) => chapter.chapterid !== chapterid
      );
    },
    addChapter(
      state: t.State,
      action: PayloadAction<{ chapter: t.Chapter; bookid: string }>
    ) {
      const { chapter, bookid } = action.payload;
      const book = state.books.find((book) => book.bookid === bookid);
      if (!book) return;
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
      //state.panels.bookList.open = false;
      //state.panels.chapterList.open = false;
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
    setChapterStatus(state: t.State, action: PayloadAction<t.ChapterStatus>) {
      const chapter = getSelectedChapter({ library: state });
      chapter.status = action.payload;
      state.saved = false;
    },
    pushTextToEditor(state: t.State, action: PayloadAction<t.NewTextForBlock>) {
      const { index, text } = action.payload;
      state.editor._pushTextToEditor = text;
      const chapter = getSelectedChapter({ library: state });
      chapter.text[index].text = text;

      state.saved = false;
    },
    restoreFromHistory(
      state: t.State,
      action: PayloadAction<{ text: string; metaKey: boolean }>
    ) {
      const { text, metaKey } = action.payload;
      const { activeTextIndex } = state.editor;
      const chapter = getSelectedChapter({ library: state });

      if (metaKey) {
        chapter.text[activeTextIndex].text = text;
      } else {
        const blocks = text.split("\n---\n");
        const newBlocks = blocks.map((blockText) => {
          return restoreBlockFromHistory(blockText);
        });

        chapter.text = newBlocks;
      }
      state.editor._pushTextToEditor = text;
      state.saved = false;
    },
    setTitle(state: t.State, action) {
      const chapter = getSelectedChapter({ library: state });
      chapter.title = action.payload;

      state.saved = false;
    },
    setAPStyleTitle(state: t.State) {
      const chapter = getSelectedChapter({ library: state });
      chapter.title = apStyleTitleCase(chapter.title);

      state.saved = false;
    },
    setBookTitle(state: t.State, action) {
      const book = getSelectedBook({ library: state });
      book.title = action.payload;

      state.saved = false;
    },
    setBookSynopsis(state: t.State, action) {
      const book = getSelectedBook({ library: state });
      book.synopsis = action.payload;

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
    moveChapter(state: t.State, action: PayloadAction<string>) {
      const chapter = getSelectedChapter({ library: state });
      const book = getSelectedBook({ library: state });
      book.chapterOrder = book.chapterOrder.filter(
        (id) => id !== chapter.chapterid
      );
      book.chapters = book.chapters.filter(
        (c) => c.chapterid !== chapter.chapterid
      );

      const newBookId = action.payload;
      chapter.bookid = newBookId;

      const newBook = state.books.find((b) => b.bookid === newBookId);
      if (newBook) {
        newBook.chapterOrder.unshift(chapter.chapterid);
        newBook.chapters.unshift(chapter);
      }

      state.saved = false;
    },
    setLastTrainedAt(state: t.State, action: PayloadAction<number>) {
      const book = getSelectedBook({ library: state });
      book.lastTrainedAt = action.payload;
      book.chapters.forEach((chapter) => {
        chapter.embeddingsLastCalculatedAt = action.payload;
      });
      state.saved = false;
    },
    updateChapter(state: t.State, action: PayloadAction<t.Chapter>) {
      const chapter = action.payload;
      const book = getSelectedBook({ library: state });
      if (!book || !chapter) return;

      let bookidChanged = false;
      book.chapters = book.chapters.map((c) => {
        if (c.chapterid === chapter.chapterid) {
          if (c.bookid !== chapter.bookid) {
            bookidChanged = true;
          }

          return chapter;
        }

        return c;
      });
      if (bookidChanged) {
        book.chapterOrder = book.chapterOrder.filter(
          (id) => id !== chapter.chapterid
        );
        book.chapters = book.chapters.filter(
          (c) => c.chapterid !== chapter.chapterid
        );
        const newBook = state.books.find((b) => b.bookid === chapter.bookid);
        if (newBook) {
          newBook.chapterOrder.unshift(chapter.chapterid);
          newBook.chapters.unshift(chapter);
        }
      }
    },
    addToContents(state: t.State, action: PayloadAction<string>) {
      const toAdd = action.payload;
      const { activeTextIndex } = state.editor;
      const chapter = getSelectedChapter({ library: state });
      const cur = chapter.text[activeTextIndex];
      let { index, length, contents } = state.editor.selectedText;
      if (index === 0) {
        index = state.editor._cachedSelectedText.index;
        length = state.editor._cachedSelectedText.length;
        contents = state.editor._cachedSelectedText.contents;
      }
      let newText = "";
      if (index) {
        newText = strSplice(cur.text, index, length, toAdd);
      } else {
        newText = `${cur.text} ${toAdd}`;
      }
      cur.text = newText;
      state.editor._pushTextToEditor = newText;
      state.saved = false;
    },
    setSelectedText(state: t.State, action: PayloadAction<t.SelectedText>) {
      state.editor.selectedText = action.payload;
    },
    clearSelectedText(state) {
      state.editor._cachedSelectedText = state.editor.selectedText;
      state.editor.selectedText = { index: 0, length: 0, contents: "" };
    },
    clearCachedSelectedText(state) {
      state.editor._cachedSelectedText = null;
    },
    addSuggestion(
      state: t.State,
      action: PayloadAction<{ label: string; value: string }>
    ) {
      const { label, value } = action.payload;
      state.suggestions.push({
        type: label,
        contents: value,
      });

      const chapter = getSelectedChapter({ library: state });
      const index = state.editor.activeTextIndex;
      console.log("addSuggestion", chapter, index);
      if (chapter && index !== null && index !== undefined) {
        const text = chapter.text[index];
        if (text.type !== "embeddedText") {
          text.versions ||= [];
          const id = nanoid();
          text.versions.push({
            id,
            text: value,
            createdAt: Date.now(),
            title: value.substring(0, 10),
          });
          text.diffWith = id;
          text.id = nanoid();
        }
      }

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
    setScrollTo(state: t.State, action: PayloadAction<number>) {
      state.scrollTo = action.payload;
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
        state.panels.bookList.open ? "true" : "false"
      );
    },
    toggleChapterList(state) {
      state.panels.chapterList.open = !state.panels.chapterList.open;
      localStorage.setItem(
        "chapterListOpen",
        state.panels.chapterList.open ? "true" : "false"
      );
    },
    toggleSidebar(state) {
      state.panels.sidebar.open = !state.panels.sidebar.open;
      localStorage.setItem(
        "sidebarOpen",
        state.panels.sidebar.open ? "true" : "false"
      );
    },
    togglePrompts(state) {
      state.panels.prompts.open = !state.panels.prompts.open;
      localStorage.setItem(
        "promptsOpen",
        state.panels.prompts.open ? "true" : "false"
      );
    },
    closeAllPanels(state) {
      const panels = current(state.panels);
      state._cachedPanelState = { ...panels };
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
      if (state._cachedPanelState) {
        state.panels = { ...state._cachedPanelState };
      } else {
        state.panels.bookList.open = true;
        state.panels.chapterList.open = true;
        state.panels.sidebar.open = true;
        state.panels.prompts.open = true;
      }
      state._cachedPanelState = null;
      localStorage.setItem("bookListOpen", state.panels.bookList.open);
      localStorage.setItem("chapterListOpen", state.panels.chapterList.open);
      localStorage.setItem("sidebarOpen", state.panels.sidebar.open);
      localStorage.setItem("promptsOpen", state.panels.prompts.open);
    },
    openOnlyPanel(state, action: PayloadAction<string>) {
      const bookListOpen = action.payload === "bookList";
      const chapterListOpen = action.payload === "chapterList";
      const sidebarOpen = action.payload === "sidebar";
      const promptsOpen = action.payload === "prompts";

      state.panels.bookList.open = bookListOpen;
      state.panels.chapterList.open = chapterListOpen;
      state.panels.sidebar.open = sidebarOpen;
      state.panels.prompts.open = promptsOpen;

      localStorage.setItem("bookListOpen", bookListOpen.toString());
      localStorage.setItem("chapterListOpen", chapterListOpen.toString());
      localStorage.setItem("sidebarOpen", sidebarOpen.toString());
      localStorage.setItem("promptsOpen", promptsOpen.toString());
    },
    setActivePanel(state: t.State, action: PayloadAction<string>) {
      state.panels.sidebar.activePanel = action.payload;
      localStorage.setItem("activePanel", action.payload);
    },
    toggleLauncher(state) {
      state.launcherOpen = !state.launcherOpen;
    },
    hidePopup(state) {
      state.popupOpen = false;
    },
    showPopup(state, action: PayloadAction<t.PopupData>) {
      state.popupOpen = true;
      state.popupData = action.payload;
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
    gotoNextOpenBlock(state: t.State) {
      if (
        state.editor.activeTextIndex === null ||
        state.editor.activeTextIndex === undefined
      ) {
        state.editor.activeTextIndex = 0;
      } else {
        const index = state.editor.activeTextIndex;
        const chapter = getSelectedChapter({ library: state });
        const nextTexts = chapter.text.slice(index + 1);
        const nextOpenText = nextTexts.find((text) => text.open);
        if (nextOpenText) {
          state.editor.activeTextIndex = chapter.text.indexOf(nextOpenText);
        }
      }
      state.saved = false;
    },
    gotoPreviousOpenBlock(state: t.State) {
      if (
        state.editor.activeTextIndex === null ||
        state.editor.activeTextIndex === undefined
      ) {
        state.editor.activeTextIndex = 0;
      } else {
        const index = state.editor.activeTextIndex;
        const chapter = getSelectedChapter({ library: state });
        const prevTexts = chapter.text.slice(0, index);
        const prevOpenText = prevTexts.reverse().find((text) => text.open);

        if (prevOpenText) {
          state.editor.activeTextIndex = chapter.text.indexOf(prevOpenText);
        }
      }
      state.editor._pushSelectionToEditor = {
        index: -1,
        length: 0,
        contents: "",
      };
      state.saved = false;
    },
    clearPushSelectionToEditor(state: t.State) {
      state.editor._pushSelectionToEditor = null;
    },

    setLanguage(
      state: t.State,
      action: PayloadAction<{ index: number; language: string }>
    ) {
      const chapter = getSelectedChapter({ library: state });
      const { index, language } = action.payload;

      const block = chapter.text[index] as t.CodeBlock;

      block.type = "code";
      block.language = language;
      state.saved = false;
    },
    toggleReference(state: t.State, action: PayloadAction<number>) {
      const chapter = getSelectedChapter({ library: state });
      const text = chapter.text[action.payload];
      text.reference = !text.reference;
      state.saved = false;
    },
    markBlockAsReference(state: t.State, action: PayloadAction<number>) {
      const chapter = getSelectedChapter({ library: state });
      chapter.text[action.payload].reference = true;
      state.saved = false;
    },
    unmarkBlockAsReference(state: t.State, action: PayloadAction<number>) {
      const chapter = getSelectedChapter({ library: state });
      chapter.text[action.payload].reference = false;
      state.saved = false;
    },
    setBlockType(
      state: t.State,
      action: PayloadAction<{ index: number; type: t.BlockType }>
    ) {
      const chapter = getSelectedChapter({ library: state });
      const { index, type } = action.payload;
      chapter.text[index].type = type;
      state.saved = false;
    },
    openBlock(state: t.State, action: PayloadAction<number>) {
      const chapter = getSelectedChapter({ library: state });
      chapter.text[action.payload].open = true;
      chapter.text[action.payload].id = nanoid();
      state.saved = false;
    },
    closeBlock(state: t.State, action: PayloadAction<number>) {
      const chapter = getSelectedChapter({ library: state });
      chapter.text[action.payload].open = false;
      chapter.text[action.payload].id = nanoid();
      state.saved = false;
    },
    newBlockBeforeCurrent(state: t.State) {
      const newBlock = newBlockFromCurrent(state);
      const chapter = getSelectedChapter({ library: state });
      chapter.text.splice(state.editor.activeTextIndex, 0, newBlock);

      state.saved = false;
    },

    addVersion(
      state: t.State,
      action: PayloadAction<{
        index: string;
        text?: string;
        setDiffWith?: boolean;
      }>
    ) {
      const chapter = getSelectedChapter({ library: state });
      const { index, text, setDiffWith } = action.payload;
      const block = chapter.text[index];
      const chap = current(chapter);
      const id = nanoid();
      block.versions ||= [];

      if (setDiffWith) {
        block.versions.push({
          id,
          text: text || "",
          createdAt: Date.now(),
          title: (text || "").substring(0, 10),
        });

        block.id = nanoid();

        block.diffWith = id;
      } else {
        block.versions.push({
          id,
          text: block.text,
          createdAt: Date.now(),
          title: block.text.substring(0, 10),
        });
        block.text = text || "";
        block.id = nanoid();
      }

      state.saved = false;
    },
    switchVersion(
      state: t.State,
      action: PayloadAction<{ index: number; versionid: string }>
    ) {
      const chapter = getSelectedChapter({ library: state });
      const { index, versionid } = action.payload;
      const block = chapter.text[index];
      if (block.type === "embeddedText") return;
      if (!block.text.match(/^\s*$/)) {
        block.versions.push({
          id: nanoid(),
          text: block.text,
          createdAt: Date.now(),
          title: block.text.substring(0, 10),
        });
      }
      block.text = block.versions.find((v) => v.id === versionid)?.text || "";
      block.versions = block.versions.filter((v) => v.id !== versionid);
      block.diffWith = null;
      block.id = nanoid();

      state.saved = false;
    },
    deleteAllVersions(
      state: t.State,
      action: PayloadAction<{ index: number }>
    ) {
      const chapter = getSelectedChapter({ library: state });
      const { index } = action.payload;
      const block = chapter.text[index];
      if (block.type === "embeddedText") return;
      block.versions = [];
      block.diffWith = null;
      block.id = nanoid();

      state.saved = false;
    },
    setDiffWith(
      state: t.State,
      action: PayloadAction<{ index: number; diffWith: string }>
    ) {
      const chapter = getSelectedChapter({ library: state });
      const { index, diffWith } = action.payload;
      const block = chapter.text[index];
      if (block.type === "embeddedText") return;
      block.diffWith = diffWith;
      block.id = nanoid();

      state.saved = false;
    },
    addCaption(
      state: t.State,
      action: PayloadAction<{ index: number; caption: string }>
    ) {
      const chapter = getSelectedChapter({ library: state });
      const { index, caption } = action.payload;
      const block = chapter.text[index];
      console.log("addCaption", block);
      block.caption = caption;
      block.id = nanoid();

      state.saved = false;
    },
    newBlockAfterCurrent(state: t.State) {
      const newBlock = newBlockFromCurrent(state);
      const chapter = getSelectedChapter({ library: state });
      chapter.text.splice(state.editor.activeTextIndex + 1, 0, newBlock);
      state.editor.activeTextIndex += 1;

      state.saved = false;
    },
    mergeBlockUp(state: t.State, action: PayloadAction<number | null>) {
      const index = action.payload || state.editor.activeTextIndex;
      if (index === 0) return;
      const chapter = getSelectedChapter({ library: state });
      const cur = chapter.text[index];
      const prev = chapter.text[index - 1];
      prev.text += `\n${cur.text}`;
      cur.text = "";
      chapter.text.splice(index, 1);
      prev.id = nanoid();

      state.saved = false;
    },
    mergeBlockDown(state: t.State, action: PayloadAction<number | null>) {
      const index = action.payload || state.editor.activeTextIndex;
      const chapter = getSelectedChapter({ library: state });
      if (index === chapter.text.length - 1) return;
      const cur = chapter.text[index];
      const next = chapter.text[index + 1];
      cur.text += `\n${next.text}`;
      chapter.text.splice(index + 1, 1);
      cur.id = nanoid();

      state.saved = false;
    },
    mergeBlockSurrounding(
      state: t.State,
      action: PayloadAction<number | null>
    ) {
      const index = action.payload || state.editor.activeTextIndex;
      const chapter = getSelectedChapter({ library: state });
      if (index === chapter.text.length - 1) return;
      const cur = chapter.text[index];
      const next = chapter.text[index + 1];
      const prev = chapter.text[index - 1];
      prev.text += `\n${cur.text}\n${next.text}`;
      cur.text = "";
      chapter.text.splice(index, 2);
      prev.id = nanoid();

      state.saved = false;
    },
    deleteBlock(state: t.State, action: PayloadAction<number>) {
      const index = action.payload;
      const chapter = getSelectedChapter({ library: state });
      if (chapter.text.length === 1) return;
      let newActiveIndex = index;
      if (index !== 0) {
        newActiveIndex = index - 1;
      }
      state.editor.activeTextIndex = newActiveIndex;
      chapter.text.splice(index, 1);
      state.saved = false;
    },
    extractBlock(state: t.State) {
      let { index, length, contents } = state.editor.selectedText;
      if (
        length === 0 &&
        state.editor._cachedSelectedText &&
        state.editor._cachedSelectedText.length > 0
      ) {
        index = state.editor._cachedSelectedText.index;
        length = state.editor._cachedSelectedText.length;
        contents = state.editor._cachedSelectedText.contents;
      }
      const chapter = getSelectedChapter({ library: state });
      const text = chapter.text[state.editor.activeTextIndex];

      /*        console.log("extractBlock", index, length, contents, text.text, state.editor.activeTextIndex)
       */ if (length === 0) {
        if (index === 0) {
          // newBlockBeforeCurrent
          const newBlock = newBlockFromCurrent(state);
          chapter.text.splice(state.editor.activeTextIndex, 0, newBlock);
          const cur = current(chapter.text);
          //   console.log("cur", cur)
          //        state.saved = false;
          return;
        } else if (index === text.text.length - 1) {
          // newBlockAfterCurrent
          const newBlock = newBlockFromCurrent(state);

          chapter.text.splice(state.editor.activeTextIndex + 1, 0, newBlock);
          state.editor.activeTextIndex += 1;
          state.saved = false;
          return;
        } else {
          return;
        }
      }
      const newText = strSplice(text.text, index, length).trim();
      const newBlock = newBlockFromCurrent(state, contents.trim());

      // all the text before the selection
      const startText = text.text.slice(0, index).trim();
      // all the text after the selection
      const endText = text.text.slice(index + length).trim();

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
        state.editor.activeTextIndex += 1;
      } else if (index + length === text.text.length) {
        console.log("end-nowhitespace");
        // we selected the end of the text,
        // so new block will be at the end
        text.text = newText;
        state.editor._pushTextToEditor = newText;
        chapter.text.splice(state.editor.activeTextIndex + 1, 0, newBlock);
        state.editor.activeTextIndex += 1;
      } else {
        console.log("middle");
        // we selected the middle of the text,
        // so new block will be in the middle

        // the selected text
        chapter.text.splice(state.editor.activeTextIndex + 1, 0, newBlock);

        text.text = startText;
        state.editor._pushTextToEditor = startText;

        const endBlock = newBlockFromCurrent(state, endText);
        chapter.text.splice(state.editor.activeTextIndex + 2, 0, endBlock);
        state.editor.activeTextIndex += 1;
      }
    },
    addCharacter(state: t.State, action: PayloadAction<string>) {
      const book = getSelectedBook({ library: state });

      if (book.characters) {
        book.characters.push(t.newCharacter());
      } else {
        book.characters = [t.newCharacter()];
      }

      state.saved = false;
    },
    editCharacter(
      state: t.State,
      action: PayloadAction<{ index: number; character: t.Character }>
    ) {
      const book = getSelectedBook({ library: state });
      book.characters[action.payload.index] = action.payload.character;
      state.saved = false;
    },
    deleteCharacter(state: t.State, action: PayloadAction<{ index: number }>) {
      const book = getSelectedBook({ library: state });
      book.characters.splice(action.payload.index, 1);
      state.saved = false;
    },
    setEmbeddedChapter(
      state: t.State,
      action: PayloadAction<{
        index: number;
        bookid: string;
        chapterid: string;
      }>
    ) {
      const chapter = getSelectedChapter({ library: state });
      const { index, bookid, chapterid } = action.payload;
      const block = chapter.text[index];
      if (block && block.type === "embeddedText") {
        block.bookid = bookid;
        block.chapterid = chapterid;
      }

      block.id = nanoid();
      state.saved = false;
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
    (book) => book.bookid === state.library.selectedBookId
  );

  return book;
};

export const getSelectedChapter = (state: RootState): t.Chapter | null => {
  if (!state.library.booksLoaded) return null;

  const book = getSelectedBook(state);
  if (!book) return null;
  const chapter = book.chapters.find(
    (chapter) => chapter.chapterid === state.library.selectedChapterId
  );

  return chapter;
};

export const getSelectedChapterTitle = (state: RootState): string | null => {
  const chapter = getSelectedChapter(state);
  if (!chapter) return null;

  return chapter.title;
};

export const getSelectedChapterTextLength = (
  state: RootState
): number | null => {
  const chapter = getSelectedChapter(state);
  if (!chapter) return null;

  return chapter.text.length;
};

export const getCompostBookId = (state: RootState): string | null => {
  const compostBook = state.library.books.find(
    (b: t.Book) => b.tag === "compost"
  );
  if (compostBook) {
    return compostBook.bookid;
  }
  return null;
};

export const getText =
  (index: number) =>
  (state: RootState): t.TextBlock | null => {
    const chapter = getSelectedChapter(state);
    if (!chapter) return null;

    return chapter.text[index];
  };

export const getChapter =
  (chapterid: t.ChapterId) =>
  (state: RootState): t.Chapter | null => {
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
  state: RootState
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
    const sortedByCreated = sortBy(chapters, ["created_at"]);

    sortedByCreated.forEach((chapter) => {
      if (!sortedChapters.includes(chapter)) sortedChapters.push(chapter);
    });
    return sortedChapters;
  }
  return chapters;
};

export const getCharacters = (state: RootState): t.Character[] | null => {
  const book = getSelectedBook(state);

  if (!book) return null;
  return book.characters;
};

export function newBlockFromCurrent(
  state: t.State,
  defaultText = ""
): t.TextBlock | null {
  const chapter = getSelectedChapter({ library: state });
  if (!chapter) return null;
  if (
    state.editor.activeTextIndex === null ||
    state.editor.activeTextIndex === undefined
  )
    return null;

  const text = chapter.text[state.editor.activeTextIndex];
  if (text.type === "plain") {
    return t.plainTextBlock(defaultText);
  } else if (text.type === "markdown") {
    return t.markdownBlock(defaultText);
  } else if (text.type === "code") {
    return t.codeBlock(defaultText, text.language);
  }
  return null;
}

export const defaultSettings: t.UserSettings = {
  model: "",
  max_tokens: 0,
  num_suggestions: 0,
  theme: "default",
  version_control: false,
  prompts: [],
  design: null,
};
