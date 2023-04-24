export type State = {
  books: Book[];
  error: string;
  loading: boolean;
  booksLoaded: boolean;
  selectedBookId: string | null;
  selectedChapterId: ChapterId | null;
  editor: EditorState;
  infoPanel: InfoPanelState;
  panels: PanelState;
  suggestions: Suggestion[];
  saved: boolean;
  _temporaryFocusModeState?: string;
  viewMode: ViewMode;
  launcherOpen: boolean;
};

export type ViewMode = "default" | "focus" | "fullscreen" | "grid";

export type Panel = {
  open: boolean;
  activePanel?: string;
};

export type PanelState = {
  [key: string]: Panel;
};

export type SelectedText = {
  index: number;
  length: number;
  contents: string;
};

export type EditorState = {
  contents: any;
  selectedText: SelectedText;
  _cachedSelectedText?: SelectedText;
  _pushTextToEditor?: string;

  _pushContentToEditor?: string;
};

export type InfoPanelState = {
  syllables: number;
};

export type ButtonSize = "small" | "medium" | "large";

export type Suggestion = {
  type: string;
  contents: string;
};

export type Pos = {
  x: number;
  y: number;
};

export type PlainTextBlock = {
  type: "plain";
  text: string;
};

export type FoldableBlock = {
  type: "foldable";
  text: string;
  folded: boolean;
};

export function plainTextBlock(text: string): PlainTextBlock {
  return { type: "plain", text };
}

export function foldableBlock(text: string): FoldableBlock {
  return { type: "foldable", text, folded: true };
}

export type TextBlock = PlainTextBlock | FoldableBlock;

export type NewTextForBlock = { index: number; text: string };

export type Chapter = {
  bookid: string;
  chapterid: string;
  title: string;
  text: TextBlock[];
  pos: Pos;
  suggestions: Suggestion[];
  favorite: boolean;
};

export type Column = {
  title: string;
};

export type ChapterId = string;

export type Book = {
  userid: string;
  bookid: string;
  title: string;
  author: string;
  chapterOrder: ChapterId[];
  chapters: Chapter[];
  design: {
    coverColor: string;
    labelColor: string;
    labelLinesColor: string;
  };
  columnHeadings: string[];
  rowHeadings: string[];
  favorite: boolean;
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

export type History = string[];

export type Error = {
  tag: "error";
  message: string;
};

export type Success = {
  tag: "success";
  payload: any;
};

export type Result = Error | Success;

export const error = (message: string): Error => ({ tag: "error", message });
export const success = (payload: any = null): Success => ({
  tag: "success",
  payload,
});

export type MenuItem = {
  label: string;
  icon?: any;
  onClick: () => void;
  className?: string;
};

export type ReducerAction = {
  type: string;
  payload?: any;
};

type ActivePanel = "info" | "suggestions" | "settings" | "history";
