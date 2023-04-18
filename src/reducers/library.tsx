import produce, { Draft } from "immer";
import * as t from "../Types";
import { localStorageOrDefault } from "../utils";

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
  };
};

export const reducer = produce<t.State>(
  (draft: Draft<t.State>, action: any) => {
    switch (action.type) {
      case "SET_BOOKS":
        draft.books = action.payload;
        break;
      case "SET_BOOK":
        draft.selectedBook = action.payload;
        break;
      case "SET_CHAPTER":
        const chapter = action.payload;
        draft.editor = initialEditorState(chapter);
        draft.chapter = chapter;
        draft.suggestions = chapter.suggestions;
        break;
      case "SET_NO_CHAPTER":
        draft.editor = initialEditorState(null);
        draft.chapter = null;
        draft.suggestions = [];
        break;
      case "SET_ERROR":
        draft.error = action.payload;
        break;
      case "CLEAR_ERROR":
        draft.error = "";
        break;
      case "LOADING":
        draft.loading = true;
        break;
      case "LOADED":
        draft.loading = false;
        break;
      case "SET_TEXT":
        draft.editor.text = action.payload;
        draft.chapter.text = action.payload;
        draft.saved = false;
        break;
      case "PUSH_TEXT_TO_EDITOR":
        draft.editor.text = action.payload;
        draft.editor._pushTextToEditor = action.payload;
        draft.chapter.text = action.payload;
        draft.saved = false;
        break;
      case "SET_TITLE":
        draft.editor.title = action.payload;
        draft.chapter.title = action.payload;
        // find chapter and then update it so that the chapter list also receives the update.
        const chapterIdx = draft.selectedBook.chapters.findIndex(
          (chapter) => chapter.chapterid === draft.chapter.chapterid,
        );

        if (chapterIdx !== -1) {
          draft.selectedBook.chapters[chapterIdx].title = action.payload;
        }
        draft.saved = false;
        break;
      case "SET_CONTENTS":
        draft.editor.contents = action.payload;
        break;
      case "SET_LOADED_CHAPTER_DATA":
        draft.chapter = action.payload.chapter;
        draft.suggestions = action.payload.suggestions;
        draft.editor.text = action.payload.text;
        draft.editor.title = action.payload.title;
        draft.editor.chapterid = action.payload.chapterid;
        break;
      case "SET_SUGGESTIONS":
        if (action.payload) {
          draft.suggestions = action.payload;
          draft.saved = false;
        }
        break;
      case "SET_SAVED":
        draft.saved = action.payload;
        break;
      case "SET_ERROR":
        draft.error = action.payload;
        break;
      case "SET_SELECTED_BOOK_CHAPTER":
        const _chapter = action.payload;
        const idx = draft.selectedBook.chapters.findIndex(
          (sbChapter) => sbChapter.chapterid === _chapter.chapterid,
        );

        if (idx >= 0) {
          draft.selectedBook.chapters[idx] = _chapter;
        }
        break;
      case "CLEAR_ERROR":
        // draft.error = "";
        break;
      case "ADD_TO_CONTENTS":
        if (!draft.editor.contents.insert) return;

        draft.editor.contents.insert(action.payload);
        draft.editor.text += action.payload;
        draft.saved = false;

        break;
      case "SET_SYNONYMS":
        draft.synonyms = action.payload;
        break;
      case "CLEAR_SYNONYMS":
        draft.synonyms = [];
        break;
      case "SET_TOOLTIP_POSITION":
        draft.editor.tooltipPosition = action.payload;
        break;
      case "OPEN_TOOLTIP":
        draft.editor.tooltipOpen = true;
        break;
      case "CLOSE_TOOLTIP":
        draft.editor.tooltipOpen = false;
        break;
      case "SET_SELECTED_TEXT":
        draft.editor.selectedText = action.payload;
        break;
      case "CLEAR_SELECTED_TEXT":
        draft.editor._cachedSelectedText = draft.editor.selectedText;
        draft.editor.selectedText = { index: 0, length: 0, contents: "" };
        console.log(
          "clearing selected text",
          draft.editor._cachedSelectedText,
          draft.editor.selectedText,
        );
        break;
      case "SYNONYM_SELECTED":
        draft.editor.selectedText = action.payload;
        draft.editor.tooltipOpen = false;
        break;
      case "ADD_SUGGESTION":
        draft.suggestions.push({
          type: action.label,
          contents: action.payload,
        });
        draft.saved = false;
        break;
      case "DELETE_SUGGESTION":
        draft.suggestions.splice(action.payload, 1);
        draft.saved = false;
        break;
      case "SET_ALL_NEW_STATE":
        // eslint-disable-next-line
        return action.payload;
      case "SET_CHAPTER_ORDER":
        const { ids, bookid } = action.payload;
        console.log(ids);
        const newTitles = [];
        ids.forEach((id) => {
          const chapter = draft.selectedBook.chapterTitles.find(
            (chapter) => chapter.chapterid === id,
          );
          if (chapter) {
            newTitles.push(chapter);
          }
        });
        draft.selectedBook.chapterTitles = newTitles;
        draft.saved = false;
        break;
      case "SET_TEMPORARY_FOCUS_MODE_STATE":
        draft._temporaryFocusModeState = action.payload;
        break;
      case "SET_VIEW_MODE":
        draft.viewMode = action.payload;
        break;
      case "OPEN_BOOK_LIST":
        draft.panels.bookList.open = true;
        localStorage.setItem("bookListOpen", "true");
        break;
      case "CLOSE_BOOK_LIST":
        draft.panels.bookList.open = false;
        localStorage.setItem("bookListOpen", "false");
        break;
      case "OPEN_CHAPTER_LIST":
        draft.panels.chapterList.open = true;
        localStorage.setItem("chapterListOpen", "true");
        break;
      case "CLOSE_CHAPTER_LIST":
        draft.panels.chapterList.open = false;
        localStorage.setItem("chapterListOpen", "false");
        break;
      case "OPEN_SIDEBAR":
        draft.panels.sidebar.open = true;
        localStorage.setItem("sidebarOpen", "true");
        break;
      case "CLOSE_SIDEBAR":
        draft.panels.sidebar.open = false;
        localStorage.setItem("sidebarOpen", "false");
        break;
      case "OPEN_PROMPTS":
        draft.panels.prompts.open = true;
        localStorage.setItem("promptsOpen", "true");
        break;
      case "CLOSE_PROMPTS":
        draft.panels.prompts.open = false;
        localStorage.setItem("promptsOpen", "false");
        break;
      case "TOGGLE_BOOK_LIST":
        draft.panels.bookList.open = !draft.panels.bookList.open;
        localStorage.setItem(
          "bookListOpen",
          draft.panels.bookList.open ? "true" : "false",
        );
        break;
      case "TOGGLE_CHAPTER_LIST":
        draft.panels.chapterList.open = !draft.panels.chapterList.open;
        localStorage.setItem(
          "chapterListOpen",
          draft.panels.chapterList.open ? "true" : "false",
        );
        break;
      case "TOGGLE_SIDEBAR":
        draft.panels.sidebar.open = !draft.panels.sidebar.open;
        localStorage.setItem(
          "sidebarOpen",
          draft.panels.sidebar.open ? "true" : "false",
        );
        break;
      case "TOGGLE_PROMPTS":
        draft.panels.prompts.open = !draft.panels.prompts.open;
        localStorage.setItem(
          "promptsOpen",
          draft.panels.prompts.open ? "true" : "false",
        );
        break;
      case "CLOSE_ALL_PANELS":
        draft.panels.bookList.open = false;
        draft.panels.chapterList.open = false;
        draft.panels.sidebar.open = false;
        draft.panels.prompts.open = false;
        localStorage.setItem("bookListOpen", "false");
        localStorage.setItem("chapterListOpen", "false");
        localStorage.setItem("sidebarOpen", "false");
        localStorage.setItem("promptsOpen", "false");
        break;
      case "OPEN_ALL_PANELS":
        draft.panels.bookList.open = true;
        draft.panels.chapterList.open = true;
        draft.panels.sidebar.open = true;
        draft.panels.prompts.open = true;
        localStorage.setItem("bookListOpen", "true");
        localStorage.setItem("chapterListOpen", "true");
        localStorage.setItem("sidebarOpen", "true");
        localStorage.setItem("promptsOpen", "true");
        break;
      case "SET_ACTIVE_PANEL":
        draft.panels.sidebar.activePanel = action.payload;
        localStorage.setItem("activePanel", action.payload);
        break;
      case "SET_VIEW_MODE":
        draft.viewMode = action.payload;
        break;

      default:
        // eslint-disable-next-line
        return draft;
    }
  },
);
