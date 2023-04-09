import produce, { current } from "immer";
import { EditorState, State } from "../Types";

export const reducer = produce((draft: State, action: any) => {
    switch (action.type) {
        case "setText":
            console.log("setText", action.payload);            
            draft.editor.text = action.payload;
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
            draft.editor.cachedSelectedTextContents = draft.editor.selectedText.contents
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
    }
});

const initialEditorState: EditorState = {
    title: "",
    text: "",
    contents: {},
    chapterid: "",
    tooltipPosition: { top: 0, left: 0 },
    tooltipOpen: false,
    selectedText: { index: 0, length: 0, contents: "" },
};

export const initialState = (chapterid: string): State => {
    return {
        editor: initialEditorState,
        chapterid,
        chapter: null,
        synonyms: [],
        infoPanel: { syllables: 0 },
        suggestions: [
            {
                type: "expand",
                contents:
                    "In a faraway kingdom, there lived a vibrant young princess who was beloved by her people. Despite her royal wealth, not to mention her long flowing hair, the young princess felt trapped in the castle walls. She was desperate to explore the      ",
            },
        ],
        saved: true,
        error: "",
        loading: true,
    }
};