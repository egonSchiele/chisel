import { nanoid } from "nanoid";

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
  popupOpen: boolean;
  popupData: PopupData | null;
};

export type SelectedText = {
  index: number;
  length: number;
  contents: string;
};

export type EditorState = {
  contents: any;
  activeTextIndex: number;
  selectedText: SelectedText;
  _cachedSelectedText?: SelectedText;
  _pushTextToEditor?: string;
};

export type PopupData = {
  title: string;
  inputValue: string;
  options?: SelectOption[];
  onSubmit: (value:string) => void;
}

export type ViewMode = "default" | "focus" | "fullscreen" | "grid" | "diff" | "readonly";

export type Panel = {
  open: boolean;
  activePanel?: string;
};

export type PanelState = {
  [key: string]: Panel;
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

export type BaseBlock = {
  text: string;
  open?: boolean;
  id?: string;
  reference?: boolean;
};

export type PlainTextBlock = BaseBlock & {
  type: "plain";
}
export type MarkdownBlock = BaseBlock & {
  type: "markdown";
}

export type CodeBlock = BaseBlock & {
  type: "code";
  language?: string;
}

export const blockTypes = ["plain", "markdown", "code"];
export type BlockType = "plain" | "markdown" | "code";

export function plainTextBlock(text: string): PlainTextBlock {
  return { type: "plain", open: true, id: nanoid(), text, reference: false };
}
export function markdownBlock(text: string): MarkdownBlock {
  return { type: "markdown", open: true, id: nanoid(), text, reference: false };
}

export function codeBlock(text: string, language:string): CodeBlock {
  return { type: "code", open: true, id: nanoid(), text, reference: false, language };
}

export function plainTextBlockFromData(text: string, open:boolean, reference:boolean): PlainTextBlock {
  return { type: "plain", open, id: nanoid(), text, reference };
}

export function markdownBlockFromData(text: string, open:boolean, reference:boolean): MarkdownBlock {
  return { type: "markdown", open, id: nanoid(), text, reference };
}

export function codeBlockFromData(text: string, open:boolean, reference:boolean, language:string): CodeBlock {
  return { type: "code", open, id: nanoid(), text, reference, language };
}

export type TextBlock = PlainTextBlock | MarkdownBlock | CodeBlock;

export type NewTextForBlock = { index: number; text: string };

export type Chapter = {
  bookid: string;
  chapterid: string;
  title: string;
  text: TextBlock[];
  pos: Pos;
  suggestions: Suggestion[];
  favorite: boolean;
  created_at?: number;
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
  };
  columnHeadings: string[];
  rowHeadings: string[];
  favorite: boolean;
  tag?: "compost";
  synopsis?: string;
  characters?: Character[];
  genre?: string;
  style?: string;
  created_at?: number;
};

export type Character = {
  name: string;
  description: string;
  imageUrl: string;
}

export function newCharacter(data={}): Character {
  return {
    name: "",
    description: "",
    imageUrl: "",
    ...data
  };
}

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
  payload
});

export type MenuItem = {
  label: string;
  tooltip?: string;
  icon?: any;
  onClick: () => void;
  className?: string;
};

export type ReducerAction = {
  type: string;
  payload?: any;
};

export type SelectOption = {
  label: string;
  value: string;
}

type ActivePanel = "info" | "suggestions" | "settings" | "history";
