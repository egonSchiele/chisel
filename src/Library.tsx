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

export default function Library() {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const [bookListOpen, setBookListOpen] = useLocalStorage("bookListOpen", true);
  const [chapterListOpen, setChapterListOpen] = useLocalStorage("chapterListOpen", true);
  const { bookid } = useParams();
  const { chapterid } = useParams();


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
    const result = await fd.fetchBook(bookid);
    if (result.tag === "success") {
      dispatch({ type: "SET_BOOK", payload: result.payload });
    } else {
      dispatch({ type: "SET_ERROR", payload: result.message });
    }
  }

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
const bothListsClosed = !bookListOpen && !chapterListOpen;
  return (
    <div className="h-screen">
      {state.error && <div className="text-red-500">{state.error}</div>}
      <div className="flex h-full">
        {bookListOpen && <div className="flex-none w-36 xl:w-48 h-full">
          <BookList
            books={state.books}
            selectedBookId={selectedBookId}
            onChange={fetchBooks}
            closeSidebar={() => setBookListOpen(false)}
          />
        </div>}
        {chapterListOpen && state.selectedBook && (
          <div className="flex-none w-40 xl:w-48 h-full">
            <ChapterList
              chapters={state.selectedBook.chapters}
              bookid={state.selectedBook.bookid}
              selectedChapterId={chapterid || ""}
              onChange={() => fetchBook()}
              closeSidebar={() => setChapterListOpen(false)}
            />
          </div>
        )}
        
        <div className={`h-full flex-grow`}>
          {chapterid && <Editor chapterid={chapterid} openBookList={() => {
            setBookListOpen(true);
            setChapterListOpen(true);
          }} closeBookList={() => {
            setBookListOpen(false);
            setChapterListOpen(false);
          }} bookListOpen={bookListOpen}
           chapterListOpen={ chapterListOpen}
          />}
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
