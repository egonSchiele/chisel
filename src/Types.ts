export type EditorState = {
  text: string;
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
};
export type ButtonSize = "small" | "medium" | "large";
