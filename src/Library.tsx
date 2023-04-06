import React, { Fragment, useEffect, useState } from "react";
import * as t from "./Types";
import "./globals.css";
import Button from "./components/Button";
import { TrashIcon } from "@heroicons/react/24/solid";
import BookList from "./BookList";
import { useParams } from "react-router-dom";
import ChapterList from "./ChapterList";
import Editor from "./Editor";

type LibraryState = {
  books: t.Book[];
  error: string;
  selectedBook: t.Book | null;
  selectedChapter: t.Chapter | null;
  loading: boolean;
};

const initialState: LibraryState = {
  books: [],
  error: "",
  selectedBook: null,
  selectedChapter: null,
  loading: false,
};

const reducer = (state: LibraryState, action: any) => {
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

export default function Library() {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const [bookListOpen, setBookListOpen] = useState(true);
  const [chapterListOpen, setChapterListOpen] = useState(true);
  const { bookid } = useParams();
  const { chapterid } = useParams();

  const fetchBook = async () => {
    if (!bookid) return;
    const res = await fetch(`/api/book/${bookid}`, { credentials: "include" });
    if (!res.ok) {
      dispatch({ type: "SET_ERROR", payload: res.statusText });
      return;
    }
    const data: t.Book = await res.json();
    console.log("got book");
    console.log(data);
    if (!data) {
      dispatch({ type: "SET_ERROR", payload: "Book not found" });
      return;
    }

    if (!data.design) {
      data.design = {
        coverColor: "bg-dmlistitem2",
        labelColor: "bg-blue-700",
        labelLinesColor: "border-yellow-400",
      };
    }
    dispatch({ type: "SET_BOOK", payload: data });
  };

  useEffect(() => {
    fetchBook();
  }, [bookid]);

  const fetchBooks = async () => {
    const res = await fetch(`/books`);
    if (!res.ok) {
      dispatch({ type: "SET_ERROR", payload: res.statusText });
      return;
    }
    const data = await res.json();
    console.log("got books");
    console.log(data);
    dispatch({ type: "SET_BOOKS", payload: data.books });
    dispatch({ type: "CLEAR_ERROR" });
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  async function deleteBook(bookid: string) {
    const res = await fetch(`/api/deleteBook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bookid }),
    });
    if (!res.ok) {
      dispatch({ type: "SET_ERROR", payload: res.statusText });
      return;
    }
  }

  const selectedBookId = state.selectedBook ? state.selectedBook.bookid : "";

  return (
    <div className="h-screen">
      {state.error && <div className="text-red-500">{state.error}</div>}
      <div className="grid grid-cols-6 h-full">
        {bookListOpen && <div className="col-span-1 h-full">
          <BookList
            books={state.books}
            selectedBookId={selectedBookId}
            onChange={fetchBooks}
            closeSidebar={() => setBookListOpen(false)}
          />
        </div>}
        {chapterListOpen && state.selectedBook && (
          <div className="col-span-1 h-full">
            <ChapterList
              chapters={state.selectedBook.chapters}
              bookid={state.selectedBook.bookid}
              selectedChapterId={chapterid || ""}
              onChange={fetchBook}
              closeSidebar={() => setChapterListOpen(false)}
            />
          </div>
        )}
        <div className="col-span-4 h-full">
          {chapterid && <Editor chapterid={chapterid} openBookList={() => {
            setBookListOpen(true);
            setChapterListOpen(true);
          }} showOpenBookListButton={!bookListOpen || !chapterListOpen} />}
        </div>
      </div>
    </div>
  );
}

/* 
<TrashIcon
className="w-6 ml-xs absolute top-0 right-0 cursor-pointer hover:text-white"
onClick={() => deleteBook(book.bookid)}
/>

<Button className="rounded mt-md" buttonType="submit">
New Book...
</Button> */
//<form className="" action="/api/newBook" method="POST">
