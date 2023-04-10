import React, { Fragment, useEffect, useState } from "react";
import * as t from "./Types";
import "./globals.css";
import Button from "./components/Button";
import { TrashIcon } from "@heroicons/react/24/solid";
import BookList from "./BookList";
import { useParams } from "react-router-dom";
import ChapterList from "./ChapterList";
import Editor from "./Editor";
import * as fd from "./fetchData";
import { initialState, reducer } from "./reducers/library";
import { useLocalStorage } from "./utils";
import Launcher from "./Launcher";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function Library() {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const [bookListOpen, setBookListOpen] = useLocalStorage("bookListOpen", true);
  const [chapterListOpen, setChapterListOpen] = useLocalStorage(
    "chapterListOpen",
    true
  );
  const { bookid, chapterid } = useParams();

  /*   const handleKeyDown = (event) => {    
    if (event.key === "Escape") {
      event.preventDefault();
      setBookListOpen(false);
      setChapterListOpen(false);
    }
  };

  useEffect(() => {    
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
 */

  const fetchBook = async () => {
    if (!bookid) {
      return;
    }
    const result = await fd.fetchBook(bookid);
    if (result.tag === "success") {
      dispatch({ type: "SET_BOOK", payload: result.payload });
    } else {
      dispatch({ type: "SET_ERROR", payload: result.message });
    }
  };

  useEffect(() => {
    fetchBook();
  }, [bookid]);

  // if the chapter id is null set the book list open to true
  // so that we do not end up with an empty screen.
  useEffect(() => {
    if (!chapterid) {
      setBookListOpen(true);
    }
  }, [chapterid]);

  // Force the chapter list open if a chapter has not been selected but a
  // book has.
  useEffect(() => {
    if (!chapterid && state.selectedBook) {
      setChapterListOpen(true);
    }
  }, [state.selectedBook, chapterid]);

  const fetchBooks = async () => {
    const result = await fd.fetchBooks();
    console.log("result", result);
    if (result.tag === "success") {
      dispatch({ type: "SET_BOOKS", payload: result.payload });
    } else {
      dispatch({ type: "SET_ERROR", payload: result.message });
    }
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

  const launchItems = [
    /* 
        {
          label: "Save",
          onClick: () => {
            saveBook(state);
          },
          icon: <SaveIcon className="h-4 w-4" aria-hidden="true" />,
        }, */
    {
      label: "New Chapter",
      onClick: () => {},
      icon: <PlusIcon className="h-4 w-4" aria-hidden="true" />,
    },
  ];

  const selectedBookId = state.selectedBook ? state.selectedBook.bookid : "";

  let chapter;
  if (chapterid && state.selectedBook) {
    chapter = state.selectedBook.chapters.find(
      (c: t.Chapter) => c.chapterid === chapterid
    );
  }

  return (
    <div className="h-screen">
      <Launcher items={launchItems} />
      {state.error && <div className="text-red-500">{state.error}</div>}
      <div className="flex h-full">
        {bookListOpen && (
          <div className="flex-none w-36 xl:w-48 h-full">
            <BookList
              books={state.books}
              selectedBookId={selectedBookId}
              onChange={fetchBooks}
              closeSidebar={() => setBookListOpen(false)}
              canCloseSidebar={chapterid !== undefined}
            />
          </div>
        )}
        {chapterListOpen && state.selectedBook && (
          <div className="flex-none w-40 xl:w-48 h-full">
            <ChapterList
              chapters={state.selectedBook.chapters}
              bookid={state.selectedBook.bookid}
              selectedChapterId={chapterid || ""}
              onChange={() => fetchBook()}
              closeSidebar={() => setChapterListOpen(false)}
              canCloseSidebar={chapterid !== undefined || !state.selectedBook}
            />
          </div>
        )}

        <div className={`h-full flex-grow`}>
          {chapter && (
            <Editor
              bookid={bookid}
              chapter={chapter}
              openBookList={() => {
                setBookListOpen(true);
                setChapterListOpen(true);
              }}
              closeBookList={() => {
                setBookListOpen(false);
                setChapterListOpen(false);
              }}
              bookListOpen={bookListOpen}
              chapterListOpen={chapterListOpen}
            />
          )}
          {/*  we run a risk of the book id being closed and not being able to be reopened */}
        </div>
      </div>
    </div>
  );
}
