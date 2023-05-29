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
function tab(chapterid) {
  return { chapterid };
}
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
  _chapter: t.Chapter | DefaultChapter | null
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
      leftSidebar: {
        open: localStorageOrDefault("leftSidebarOpen", true),
        activePanel: "outline",
      },
      rightSidebar: {
        open: localStorageOrDefault("rightSidebarOpen", false),
        activePanel: localStorageOrDefault("activePanel", "suggestions"),
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
    openTabs: [],
    activeTab: null,
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
      if (!book) return;
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
      //state.panels.leftSidebar.open = false;
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
      if (!chapter) return;
      chapter.text[index].text = text;
      state.saved = false;
    },
    setChapterStatus(state: t.State, action: PayloadAction<t.ChapterStatus>) {
      const chapter = getSelectedChapter({ library: state });
      if (!chapter) return;
      chapter.status = action.payload;
      state.saved = false;
    },
    pushTextToEditor(state: t.State, action: PayloadAction<t.NewTextForBlock>) {
      const { index, text } = action.payload;
      state.editor._pushTextToEditor = text;
      const chapter = getSelectedChapter({ library: state });
      if (!chapter) return;
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
      if (!chapter) return;
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
      if (!chapter) return;
      chapter.title = action.payload;

      state.saved = false;
    },
    setAPStyleTitle(state: t.State) {
      const chapter = getSelectedChapter({ library: state });
      if (!chapter) return;
      chapter.title = apStyleTitleCase(chapter.title);

      state.saved = false;
    },
    setBookTitle(state: t.State, action) {
      const book = getSelectedBook({ library: state });
      if (!book) return;
      book.title = action.payload;

      state.saved = false;
    },
    setBookSynopsis(state: t.State, action) {
      const book = getSelectedBook({ library: state });
      if (!book) return;
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
      if (!book) return;
      if (!chapter) return;
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
      if (!book) return;
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
      if (!chapter) return;
      const cur = chapter.text[activeTextIndex];
      let { index, length, contents } = state.editor.selectedText;
      if (index === 0 && state.editor._cachedSelectedText) {
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
    setFocusModeChecks(state, action: PayloadAction<t.FormatData[] | null>) {
      state.editor.focusModeChecks = action.payload;
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
      if (!book) return;
      book.chapterOrder = ids;
      state.saved = false;
    },
    setTemporaryFocusModeState(state: t.State, action: PayloadAction<string>) {
      state._temporaryFocusModeState = action.payload;
    },
    triggerFocusModeRerender(state: t.State) {
      state.editor._triggerFocusModeRerender =
        state.editor._triggerFocusModeRerender || 0;
      state.editor._triggerFocusModeRerender++;
    },
    setViewMode(state: t.State, action: PayloadAction<t.ViewMode>) {
      state.viewMode = action.payload;
    },
    toggleViewMode(state: t.State, action: PayloadAction<t.ViewMode>) {
      if (state.viewMode === action.payload) {
        state.viewMode = "default";
      } else {
        state.viewMode = action.payload;
      }
    },
    setScrollTo(state: t.State, action: PayloadAction<number>) {
      state.scrollTo = action.payload;
    },
    openFileNavigator(state: t.State) {
      state.panels.leftSidebar.open = true;
      state.panels.leftSidebar.activePanel = "filenavigator";
      localStorage.setItem("leftSidebarOpen", "true");
    },
    closeFileNavigator(state: t.State) {
      state.panels.leftSidebar.open = false;
      localStorage.setItem("leftSidebarOpen", "false");
    },
    openLeftSidebar(state: t.State) {
      state.panels.leftSidebar.open = true;
      localStorage.setItem("leftSidebarOpen", "true");
    },
    closeLeftSidebar(state: t.State) {
      state.panels.leftSidebar.open = false;
      localStorage.setItem("leftSidebarOpen", "false");
    },
    openRightSidebar(state: t.State) {
      state.panels.rightSidebar.open = true;
      localStorage.setItem("rightSidebarOpen", "true");
    },
    closeRightSidebar(state: t.State) {
      state.panels.rightSidebar.open = false;
      localStorage.setItem("rightSidebarOpen", "false");
    },
    /*   closePrompts(state:t.State) {
      state.panels.prompts.open = false;
      localStorage.setItem("promptsOpen", "false");
    }, */
    toggleFileNavigator(state: t.State) {
      toggleBase(state, "filenavigator");
    },
    togglePrompts(state: t.State) {
      toggleBase(state, "prompts");
    },
    toggleBlocks(state: t.State) {
      toggleBase(state, "blocks");
    },
    toggleOutline(state: t.State) {
      toggleBase(state, "outline");
    },

    toggleRightSidebar(state: t.State) {
      state.panels.rightSidebar.open = !state.panels.rightSidebar.open;
      localStorage.setItem(
        "rightSidebarOpen",
        state.panels.rightSidebar.open ? "true" : "false"
      );
    },
    /*     togglePrompts(state:t.State) {
      state.panels.prompts.open = !state.panels.prompts.open;
      localStorage.setItem(
        "promptsOpen",
        state.panels.prompts.open ? "true" : "false"
      );
    }, */
    closeAllPanels(state: t.State) {
      const panels = current(state.panels);
      state._cachedPanelState = { ...panels };
      state.panels.leftSidebar.open = false;
      state.panels.rightSidebar.open = false;
      localStorage.setItem("leftSidebarOpen", "false");
      localStorage.setItem("rightSidebarOpen", "false");
    },
    openAllPanels(state: t.State) {
      if (state._cachedPanelState) {
        state.panels = { ...state._cachedPanelState };
      } else {
        state.panels.leftSidebar.open = true;
        state.panels.rightSidebar.open = true;
      }
      state._cachedPanelState = null;
      localStorage.setItem(
        "leftSidebarOpen",
        String(state.panels.leftSidebar.open)
      );
      localStorage.setItem(
        "rightSidebarOpen",
        String(state.panels.rightSidebar.open)
      );
    },
    openOnlyPanel(state, action: PayloadAction<string>) {
      // TODO
      /*  const bookListOpen = action.payload === "bookList";
      const chapterListOpen = action.payload === "chapterList";
      const sidebarOpen = action.payload === "sidebar";
      const promptsOpen = action.payload === "prompts";

      state.panels.leftSidebar.open = bookListOpen;
      state.panels.chapterList.open = chapterListOpen;
      state.panels.sidebar.open = sidebarOpen;
      state.panels.prompts.open = promptsOpen;

      localStorage.setItem("leftSidebarOpen", bookListOpen.toString());
      localStorage.setItem("chapterListOpen", chapterListOpen.toString());
      localStorage.setItem("sidebarOpen", sidebarOpen.toString());
      localStorage.setItem("promptsOpen", promptsOpen.toString()); */
    },
    setActivePanel(state: t.State, action: PayloadAction<t.ActivePanel>) {
      state.panels.rightSidebar.activePanel = action.payload;
      localStorage.setItem("activePanel", action.payload);
    },
    toggleLauncher(state: t.State) {
      state.launcherOpen = !state.launcherOpen;
    },
    hidePopup(state: t.State) {
      state.popupOpen = false;
    },
    showPopup(state, action: PayloadAction<t.PopupData>) {
      state.popupOpen = true;
      state.popupData = action.payload;
    },
    noBookSelected(state: t.State) {
      state.selectedBookId = null;
      state.selectedChapterId = null;
    },
    noChapterSelected(state: t.State) {
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
        if (!chapter) return;
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
        if (!chapter) return;
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
    setSelection(
      state: t.State,
      payload: PayloadAction<{ index: number; length: number }>
    ) {
      const { index, length } = payload.payload;
      state.editor._pushSelectionToEditor = {
        index,
        length,
      };
    },
    clearPushSelectionToEditor(state: t.State) {
      delete state.editor._pushSelectionToEditor;
    },

    setLanguage(
      state: t.State,
      action: PayloadAction<{ index: number; language: string }>
    ) {
      const chapter = getSelectedChapter({ library: state });
      if (!chapter) return;
      const { index, language } = action.payload;

      const block = chapter.text[index] as t.CodeBlock;

      block.type = "code";
      block.language = language;
      state.saved = false;
    },
    toggleReference(state: t.State, action: PayloadAction<number>) {
      const chapter = getSelectedChapter({ library: state });
      if (!chapter) return;
      const text = chapter.text[action.payload];
      text.reference = !text.reference;
      state.saved = false;
    },
    toggleHideInExport(state: t.State, action: PayloadAction<number>) {
      const chapter = getSelectedChapter({ library: state });
      if (!chapter) return;
      const text = chapter.text[action.payload];
      text.hideInExport = !text.hideInExport;
      state.saved = false;
    },
    markBlockAsReference(state: t.State, action: PayloadAction<number>) {
      const chapter = getSelectedChapter({ library: state });
      if (!chapter) return;
      chapter.text[action.payload].reference = true;
      state.saved = false;
    },
    unmarkBlockAsReference(state: t.State, action: PayloadAction<number>) {
      const chapter = getSelectedChapter({ library: state });
      if (!chapter) return;
      chapter.text[action.payload].reference = false;
      state.saved = false;
    },
    setBlockType(
      state: t.State,
      action: PayloadAction<{ index: number; type: t.BlockType }>
    ) {
      const chapter = getSelectedChapter({ library: state });
      if (!chapter) return;
      const { index, type } = action.payload;
      chapter.text[index].type = type;
      state.saved = false;
    },
    openBlock(state: t.State, action: PayloadAction<number>) {
      const chapter = getSelectedChapter({ library: state });
      if (!chapter) return;
      chapter.text[action.payload].open = true;
      chapter.text[action.payload].id = nanoid();
      state.saved = false;
    },
    closeBlock(state: t.State, action: PayloadAction<number>) {
      const chapter = getSelectedChapter({ library: state });
      if (!chapter) return;
      chapter.text[action.payload].open = false;
      chapter.text[action.payload].id = nanoid();
      state.saved = false;
    },
    newBlockBeforeCurrent(state: t.State) {
      const newBlock = newBlockFromCurrent(state);
      const chapter = getSelectedChapter({ library: state });
      if (!chapter) return;
      if (!newBlock) return;
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
      if (!chapter) return;
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
      if (!chapter) return;
      const { index, versionid } = action.payload;
      const block = chapter.text[index];
      if (block.type === "embeddedText") return;
      if (!block.versions) return;
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
      if (!chapter) return;
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
      if (!chapter) return;
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
      if (!chapter) return;
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
      if (!chapter) return;
      if (!newBlock) return;
      chapter.text.splice(state.editor.activeTextIndex + 1, 0, newBlock);
      state.editor.activeTextIndex += 1;

      state.saved = false;
    },
    mergeBlockUp(state: t.State, action: PayloadAction<number | null>) {
      const index = action.payload || state.editor.activeTextIndex;
      if (index === 0) return;
      const chapter = getSelectedChapter({ library: state });
      if (!chapter) return;
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
      if (!chapter) return;
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
      if (!chapter) return;
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
      if (!chapter) return;
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
      if (!chapter) return;
      const text = chapter.text[state.editor.activeTextIndex];

      /*        console.log("extractBlock", index, length, contents, text.text, state.editor.activeTextIndex)
       */ if (length === 0) {
        if (index === 0) {
          // newBlockBeforeCurrent
          const newBlock = newBlockFromCurrent(state);
          if (!newBlock) return;
          chapter.text.splice(state.editor.activeTextIndex, 0, newBlock);
          const cur = current(chapter.text);
          //   console.log("cur", cur)
          //        state.saved = false;
          return;
        } else if (index === text.text.length - 1) {
          // newBlockAfterCurrent
          const newBlock = newBlockFromCurrent(state);
          if (!newBlock) return;

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
      if (!newBlock) return;
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
        if (!endBlock) return;
        chapter.text.splice(state.editor.activeTextIndex + 2, 0, endBlock);
        state.editor.activeTextIndex += 1;
      }
    },
    addCharacter(state: t.State, action: PayloadAction<string>) {
      const book = getSelectedBook({ library: state });
      if (!book) return;

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
      if (!book) return;
      if (!book.characters) return;
      book.characters[action.payload.index] = action.payload.character;
      state.saved = false;
    },
    deleteCharacter(state: t.State, action: PayloadAction<{ index: number }>) {
      const book = getSelectedBook({ library: state });
      if (!book) return;
      if (!book.characters) return;
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
      if (!chapter) return;
      const { index, bookid, chapterid } = action.payload;
      const block = chapter.text[index];
      if (block && block.type === "embeddedText") {
        block.bookid = bookid;
        block.chapterid = chapterid;
      }

      block.id = nanoid();
      state.saved = false;
    },
    newTab(state: t.State, action: PayloadAction<t.Tab>) {
      const index = state.openTabs.findIndex(
        (tab) => tab.chapterid === action.payload.chapterid
      );
      if (index !== -1) {
        state.activeTab = index;
        return;
      }
      state.openTabs.push(action.payload);
      state.activeTab = state.openTabs.length - 1;
    },
    closeTab(state: t.State, action: PayloadAction<string>) {
      const index = state.openTabs.findIndex(
        (tab) => tab.chapterid === action.payload
      );

      if (state.openTabs.length === 0) {
        state.activeTab = null;
        state.selectedChapterId = null;
      } else if (state.activeTab === index) {
        if (state.activeTab < state.openTabs.length - 1) {
          // no change, more tabs after this
          //state.activeTab = 0;
        } else {
          // last one, so move down
          state.activeTab = index - 1;
        }
        state.selectedChapterId = state.openTabs[state.activeTab].chapterid;
      }
      if (index !== -1) {
        state.openTabs.splice(index, 1);
      }
    },
    goToTab(state: t.State, action: PayloadAction<string>) {
      const index = state.openTabs.findIndex(
        (tab) => tab.chapterid === action.payload
      );
      if (index !== -1) {
        state.activeTab = index;
      }
    },
  },
  /* setTab(
    state: t.State,
    action: PayloadAction<{
      chapterid: string;
    }>
  ) {
    const index = state.openTabs.findIndex(
      (tab) => tab === action.payload.chapterid
    );
    if (index !== -1) {
      state.openTabs.splice(index, 1);
    }
    state.openTabs.push(action.payload.chapterid);
  }, */
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

  return chapter || null;
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
    const sortedChapters: t.Chapter[] = [];
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
  return book.characters || null;
};
export const getOpenTabs = (state: RootState): t.TabStateInfo[] => {
  const openTabs = state.library.openTabs;
  const tabs = openTabs.map((tab) => {
    const chapter = getChapter(tab.chapterid)(state);
    if (!chapter) return null;
    const book = state.library.books.find(
      (book) => book.bookid === chapter.bookid
    );
    if (!book) return null;
    return {
      chapterid: tab.chapterid,
      title: chapter.title,
      bookid: chapter.bookid,
      bookTitle: book.title,
    };
  });
  return tabs.filter((tab) => tab !== null);
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
    return t.codeBlock(defaultText, text.language || "javascript");
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

function toggleBase(state: t.State, panel: t.LeftActivePanel) {
  if (
    state.panels.leftSidebar.open &&
    state.panels.leftSidebar.activePanel === panel
  ) {
    state.panels.leftSidebar.open = false;
  } else {
    state.panels.leftSidebar.open = true;
    state.panels.leftSidebar.activePanel = panel;
  }

  localStorage.setItem(
    "leftSidebarOpen",
    state.panels.leftSidebar.open ? "true" : "false"
  );
}
