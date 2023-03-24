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
export type SuggestionType =
  | "expand"
  | "contract"
  | "rewrite"
  | "texttospeech"
  | "activevoice";

export type Suggestion = {
  type: SuggestionType;
  contents: string;
};

export type Pos = {
  x: number;
  y: number;
};

export type Chapter = {
  chapterid: string;
  title: string;
  text: string;
  pos: Pos;
};

export type Column = {
  title: string;
};

export type Book = {
  bookid: string;
  title: string;
  author: string;
  chapters: Chapter[];
  //columns: Column[];
};

export type Coords = {
  x: number;
  y: number;
  w: number;
  h: number;
};
