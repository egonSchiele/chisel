import LibErrorBoundary from "./LibErrorBoundary";
import React, { Reducer, useCallback, useEffect, useState } from "react";
import * as t from "./Types";
import "./globals.css";

import BookList from "./BookList";
import { useNavigate, useParams } from "react-router-dom";
import ChapterList from "./ChapterList";
import Editor from "./Editor";
import * as fd from "./lib/fetchData";
import {
  getChapterText,
  getCsrfToken,
  isTruthy,
  saveTextToHistory,
  useInterval,
} from "./utils";
import Launcher from "./Launcher";
import {
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalCircleIcon,
  EyeIcon,
  MinusIcon,
  PencilIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import PromptsSidebar from "./PromptsSidebar";
import Sidebar from "./Sidebar";
import NavButton from "./components/NavButton";
import Spinner from "./components/Spinner";
import FocusMode from "./FocusMode";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./store";
import {
  fetchBooksThunk,
  getChapter,
  getSelectedBook,
  getSelectedChapter,
  librarySlice,
} from "./reducers/librarySlice";
import DiffViewer from "./DiffViewer";
import BookEditor from "./BookEditor";
import Popup from "./components/Popup";
import LibraryLauncher from "./components/LibraryLauncher";
import Button from "./components/Button";
import LibraryContext from "./LibraryContext";
import { useColors } from "./lib/hooks";

export default function Library() {
  const state: t.State = useSelector((state: RootState) => state.library);
  const dispatch = useDispatch<AppDispatch>();

  const { bookid, chapterid } = useParams();

  const compostBookId = useSelector((state: RootState) => {
    const compostBook = state.library.books.find(
      (b: t.Book) => b.tag === "compost"
    );
    if (compostBook) {
      return compostBook.bookid;
    }
    return null;
  });

  const colors = {
    background: "bg-white dark:bg-gray-900",
  }; //useColors();

  useEffect(() => {
    if (chapterid && state.booksLoaded) {
      dispatch(librarySlice.actions.setChapter(chapterid));
      return;
    }
    dispatch(librarySlice.actions.setNoChapter());
  }, [chapterid, state.selectedBookId, state.booksLoaded]);

  useEffect(() => {
    if (bookid) {
      dispatch(librarySlice.actions.setBook(bookid));
    }
  }, [bookid]);

  const fetchBooks = async () => {
    // @ts-ignore
    dispatch(fetchBooksThunk());
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const navigate = useNavigate();

  async function newChapter(
    title = "New Chapter",
    text = "",
    _bookid: string | null = null
  ) {
    const theBookid = _bookid || bookid;
    dispatch(librarySlice.actions.loading());
    const result = await fd.newChapter(theBookid as string, title, text);
    dispatch(librarySlice.actions.loaded());
    if (result.tag === "error") {
      dispatch(librarySlice.actions.setError(result.message));
      return;
    }
    const chapter = result.payload;
    dispatch(librarySlice.actions.addChapter({ chapter, bookid: theBookid }));

    navigate(`/book/${theBookid}/chapter/${chapter.chapterid}`, {});
  }

  async function newBook() {
    const res = await fd.newBook();
    if (res.tag === "error") {
      dispatch(librarySlice.actions.setError(res.message));
    } else {
      const book = res.payload;
      dispatch(librarySlice.actions.addBook(book));
    }
  }

  async function newCompostNote() {
    const title = new Date().toDateString();
    await newChapter(title, "", compostBookId);
  }

  // TODO reuse code
  async function saveChapter(
    _chapter: t.Chapter,
    suggestions: t.Suggestion[] | null
  ) {
    let chapter: t.Chapter = { ..._chapter };
    if (suggestions !== null) {
      chapter.suggestions = suggestions;
    }
    const body = JSON.stringify({ chapter, csrfToken: getCsrfToken() });
    const result = await fetch("/api/saveChapter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    if (!result.ok || result.status !== 200) {
      const text = await result.text();

      dispatch(librarySlice.actions.setError(text));
    } else {
      const data = await result.json();
      chapter.created_at = data.created_at;

      dispatch(librarySlice.actions.clearError());
      dispatch(librarySlice.actions.setSaved(true));
      // Since we depend on a cache version of the selected book when picking a chapter
      // we must also set the chapter on said cache whenever save occurs.
      // This avoids the issue in which switching a chapter looses your last saved work.
      dispatch(librarySlice.actions.updateChapter(chapter));
    }
  }

  async function saveBook(book: t.Book) {
    if (!book) {
      console.log("no book");
      return;
    }

    let bookNoChapters = { ...book };

    bookNoChapters.chapters = [];
    const body = JSON.stringify({
      book: bookNoChapters,
      csrfToken: getCsrfToken(),
    });
    const result = await fetch("/api/saveBook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });
    if (!result.ok || result.status !== 200) {
      const text = await result.text();

      dispatch(librarySlice.actions.setError(text));
    } else {
      const data = await result.json();

      // We are going to update the book but not update its chapters.
      // This is because save chapter and save book both happen in the same cycle.
      // saveChapter updates the chapter in the redux store.
      // If we include the chapters here, it will overwrite the updates from saveChapter.
      bookNoChapters.created_at = data.created_at;
      dispatch(librarySlice.actions.clearError());
      dispatch(librarySlice.actions.setSaved(true));
      dispatch(librarySlice.actions.updateBook(bookNoChapters));
    }
  }

  if (!state.booksLoaded) {
    return (
      <div
        className={`h-screen w-screen ${colors.background} animate-pulse`}
      ></div>
    );
  }

  // @ts-ignore
  const libraryUtils: t.LibraryContextType = {
    newChapter,
    newBook,
    newCompostNote,
    saveBook,
    // @ts-ignore
    saveChapter,
  };

  return (
    <div className="h-screen">
      <LibraryContext.Provider value={libraryUtils}>
        {state.error && (
          <div className="bg-red-700 p-2 text-white flex">
            <p className="flex-grow">{state.error}</p>
            <div
              className="cursor-pointer flex-none"
              onClick={() => dispatch(librarySlice.actions.clearError())}
            >
              <XMarkIcon className="w-5 h-5 my-auto" />
            </div>
          </div>
        )}

        <div className="flex h-screen">
          {!bookid && (
            <LibErrorBoundary component="book list">
              <div className="h-screen w-full relative pb-safe ">
                <BookList />
                {compostBookId && (
                  <Button
                    onClick={() => newCompostNote()}
                    className="absolute bottom-md right-md"
                    style="secondary"
                    size="large"
                    rounded={true}
                  >
                    New note
                  </Button>
                )}
              </div>
            </LibErrorBoundary>
          )}
          {bookid && !chapterid && (
            <LibErrorBoundary component="chapter list">
              <div className="w-full h-full">
                <ChapterList selectedChapterId={chapterid || ""} />
              </div>
            </LibErrorBoundary>
          )}
        </div>
      </LibraryContext.Provider>
    </div>
  );
}
