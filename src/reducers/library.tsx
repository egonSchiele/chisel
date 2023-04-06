import * as t from "../Types";
type LibraryState = {
    books: t.Book[];
    error: string;
    selectedBook: t.Book | null;
    selectedChapter: t.Chapter | null;
    loading: boolean;
};

export const initialState: LibraryState = {
    books: [],
    error: "",
    selectedBook: null,
    selectedChapter: null,
    loading: false,
};

export const reducer = (state: LibraryState, action: any) => {
    switch (action.type) {
        case "SET_BOOKS":
            return { ...state, books: action.payload };
        case "SET_BOOK":
            return { ...state, selectedBook: action.payload };
        case "SET_CHAPTER":
            return { ...state, selectedChapter: action.payload };
        case "SET_ERROR":
            return { ...state, error: action.payload };
        case "CLEAR_ERROR":
            return { ...state, error: "" };
        case "LOADING":
            return { ...state, loading: true };
        case "LOADED":
            return { ...state, loading: false };
        default:
            return state;
    }
};