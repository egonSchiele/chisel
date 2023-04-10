import produce, { current } from "immer";
import { Chapter, EditorState, State } from "../Types";

export const reducer = produce((draft: State, action: any) => {
  switch (action.type) {
    case "setText":
      console.log("setText", action.payload);
      draft.editor.text = action.payload;
      draft.chapter.text = action.payload;
      draft.saved = false;
      break;
    case "pushTextToEditor":
      console.log("setText", action.payload);
      draft.editor.text = action.payload;
      draft.editor._pushTextToEditor = action.payload;
      draft.chapter.text = action.payload;
      draft.saved = false;
      break;
    case "setTitle":
      draft.editor.title = action.payload;
      draft.chapter.title = action.payload;
      draft.saved = false;
      break;
    case "setContents":
      draft.editor.contents = action.payload;
      break;
    case "setLoadedChapterData":
      draft.chapter = action.payload.chapter;
      draft.suggestions = action.payload.suggestions;
      draft.editor.text = action.payload.text;
      draft.editor.title = action.payload.title;
      draft.editor.chapterid = action.payload.chapterid;
      break;
    case "setSuggestions":
      if (action.payload) {
        draft.suggestions = action.payload;
        draft.saved = false;
      }
      break;
    case "setSaved":
      draft.saved = action.payload;
      break;
    case "setError":
      draft.error = action.payload;
      break;
    case "clearError":
      //draft.error = "";
      break;
    case "addToContents":
      if (!draft.editor.contents.insert) return;

      draft.editor.contents.insert(action.payload);
      draft.editor.text += action.payload;
      draft.saved = false;

      break;
    case "setSynonyms":
      draft.synonyms = action.payload;
      break;
    case "clearSynonyms":
      draft.synonyms = [];
      break;
    case "setTooltipPosition":
      draft.editor.tooltipPosition = action.payload;
      break;
    case "openTooltip":
      draft.editor.tooltipOpen = true;
      break;
    case "closeTooltip":
      draft.editor.tooltipOpen = false;
      break;
    case "setSelectedText":
      draft.editor.selectedText = action.payload;
      break;
    case "clearSelectedText":
      draft.editor.cachedSelectedTextContents =
        draft.editor.selectedText.contents;
      draft.editor.selectedText = { index: 0, length: 0, contents: "" };
      break;
    case "synonymSelected":
      draft.editor.selectedText = action.payload;
      draft.editor.tooltipOpen = false;
      break;
    case "addSuggestion":
      draft.suggestions.push({
        type: action.label,
        contents: action.payload,
      });
      draft.saved = false;
      break;
    case "deleteSuggestion":
      draft.suggestions.splice(action.payload, 1);
      draft.saved = false;
      break;
    case "setAllNewState":
      return action.payload;
  }
});

const initialEditorState = (chapter: Chapter): EditorState => {
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

export const initialState = (chapter: Chapter): State => {
  return {
    editor: initialEditorState(chapter),
    chapterid: chapter.chapterid,
    chapter,
    synonyms: [],
    infoPanel: { syllables: 0 },
    suggestions: chapter.suggestions,
    saved: true,
    error: "",
    loading: true,
  };
};
