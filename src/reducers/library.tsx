import produce, { Draft } from "immer";
import * as t from "../Types";

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
  _chapter: t.Chapter | DefaultChapter
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
    suggestions: chapter.suggestions,
    saved: true,
    error: "",
    loading: true,
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
          (chapter) => {
            return chapter.chapterid === draft.chapter.chapterid;
          }
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
      case "CLEAR_ERROR":
        //draft.error = "";
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
          draft.editor.selectedText
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
        return action.payload;
      case "SET_CHAPTER_ORDER":
        const { ids, bookid } = action.payload;
        console.log(ids);
        const newTitles = [];
        ids.forEach((id) => {
          const chapter = draft.selectedBook.chapterTitles.find(
            (chapter) => chapter.chapterid === id
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
      default:
        return draft;
    }
  }
);
