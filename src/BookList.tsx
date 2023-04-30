import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BoltIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useDispatch } from "react-redux";
import * as t from "./Types";
import List from "./components/List";
import Button from "./components/Button";
import ListMenu from "./ListMenu";
import ListItem from "./ListItem";
import Popup from "./Popup";
import { getCsrfToken } from "./utils";
import * as fd from "./fetchData";
import { librarySlice } from "./reducers/librarySlice";
import { sortBy } from "lodash";

async function deleteBook(bookid: string, onDelete) {
  const res = await fd.deleteBook(bookid);
  if (res.tag === "error") {
    console.log(res.message);
    return;
  }
  onDelete(bookid);
}

async function favoriteBook(bookid: string) {
  const res = await fd.favoriteBook(bookid);
  if (res.tag === "error") {
    console.log(res.message);
    return;
  }
}

const buttonStyles =
  "bg-sidebar hover:bg-sidebarSecondary dark:bg-dmsidebar dark:hover:bg-dmsidebarSecondary";
const buttonStylesDisabled = `${buttonStyles} disabled:opacity-50`;

export default function BookList({
  books,
  selectedBookId,
  onDelete,
  saveBook,
  newBook,
  canCloseSidebar = true,
}: {
  books: t.Book[];
  selectedBookId: string;
  onDelete: (bookid: string) => void;
  saveBook: (book: t.Book) => void;
  newBook: () => void;
  canCloseSidebar?: boolean;
}) {
  const dispatch = useDispatch();

  function startRenameBook(book) {
    dispatch(
      librarySlice.actions.showPopup({
        title: "Rename Book",
        inputValue: book.title,
        onSubmit: (newTitle) => renameBook(book, newTitle),
      })
    );
  }

  async function renameBook(book, newTitle) {
    const newBook = { ...book, title: newTitle };
    saveBook(newBook);
  }

  const compostBook = books.find((book) => book.tag === "compost");
  const otherBooks = sortBy(
    books.filter((book) => book.tag !== "compost"),
    ["title"]
  );

  function bookListItem(book, tag = null) {
    return (
      <ListItem
        link={`/book/${book.bookid}`}
        title={book.title}
        selected={book.bookid === selectedBookId}
        onDelete={() => deleteBook(book.bookid, onDelete)}
        onFavorite={() => favoriteBook(book.bookid)}
        onRename={() => startRenameBook(book)}
        selector={tag ? `booklist-${tag}` : "booklist"}
        tag={tag}
      />
    );
  }

  const items = otherBooks.map((book) => (
    <li key={book.bookid}>{bookListItem(book)}</li>
  ));

  if (compostBook) {
    items.unshift(
      <li
        key={compostBook.bookid}
        className="flex pb-xs border-b border-gray-300 dark:border-gray-700 mb-xs"
      >
        {bookListItem(compostBook, "compost")}
      </li>
    );
  }

  function close() {
    dispatch(librarySlice.actions.closeBookList());
  }

  function open() {
    dispatch(librarySlice.actions.openBookList());
  }

  const rightMenuItem = canCloseSidebar && {
    label: "Close",
    icon: <XMarkIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
    onClick: close,
    className: buttonStyles,
    animate: true,
  };

  const leftMenuItem = {
    label: "New",
    icon: <PlusIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
    onClick: () => newBook(),
    className: buttonStyles,
    showSpinner: true,
    animate: true,
  };

  return (
    <>
      <List
        title="Books"
        items={items}
        rightMenuItem={rightMenuItem}
        leftMenuItem={leftMenuItem}
        className="bg-sidebar dark:bg-dmsidebar"
        /* swipeToClose="left"
        close={close} */
        open={open}
      />
    </>
  );
}
