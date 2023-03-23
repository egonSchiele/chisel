export type EditorState = {
  text: string;
  contents: any;
  tooltipPosition: { top: number; left: number };
  tooltipOpen: boolean;
  selectedText: { index: number; length: number; contents: string };
  // selectedSyllables: number;
};

export type InfoPanelState = {
  syllables: number;
};

export type State = {
  editor: EditorState;
  synonyms: string[];
  infoPanel: InfoPanelState;
  suggestions: Suggestion[];
};
export type ButtonSize = "small" | "medium" | "large";
export type SuggestionType = "expand" | "contract" | "rewrite";

export type Suggestion = {
  type: SuggestionType;
  contents: string;
};
