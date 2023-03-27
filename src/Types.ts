export type EditorState = {
  title: string;
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
  chapterid: string;
  chapter: Chapter | null;
  synonyms: string[];
  infoPanel: InfoPanelState;
  suggestions: Suggestion[];
  saved: boolean;
  error: string;
  loading: boolean;
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
  bookid: string;
  chapterid: string;
  title: string;
  text: string;
  pos: Pos;
  suggestions: Suggestion[];
};

export type Column = {
  title: string;
};

export type Book = {
  userid: string;
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

export type UserSettings = {
  model: string;
  max_tokens: number;
  num_suggestions: number;
  theme: Theme;
  version_control: boolean;
  prompts: Prompt[];
};

export type Prompt = {
  label: string;
  text: string;
};

export type Theme = "default";

export type UserPermissions = {
  openai_api: boolean;
};

export type Usage = {
  openai_api: {
    tokens: {
      month: {
        prompt: number;
        completion: number;
      };
      total: {
        prompt: number;
        completion: number;
      };
    };
  };
};

export type User = {
  userid: string;
  email: string;
  approved: boolean;
  admin: boolean;
  permissions: UserPermissions;
  usage: Usage;
  settings: UserSettings;
  created_at: string;
};
