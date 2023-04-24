import React, { useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useDispatch } from "react-redux";
import * as t from "./Types";
import List from "./components/List";
import ListItem from "./ListItem";
import Popup from "./Popup";
import { getCsrfToken } from "./utils";
import * as fd from "./fetchData";
import { librarySlice } from "./reducers/librarySlice";

async function deleteBook(bookid: string, onDelete) {
  const res = await fd.deleteBook(bookid);
  if (res.tag === "error") {
    console.log(res.message);
    return;
  }
  onDelete(bookid);
}

async function favoriteBook(bookid: string, onChange) {
  const res = await fd.favoriteBook(bookid);
  if (res.tag === "error") {
    console.log(res.message);
    return;
  }

  await onChange();
}

async function newBook(dispatch) {
  const res = await fd.newBook();
  if (res.tag === "error") {
    console.log(res.message);
  } else {
    const book = res.payload;
    console.log("new book", book);
    dispatch(librarySlice.actions.addBook(book));
  }
}

const buttonStyles =
  "bg-sidebar hover:bg-sidebarSecondary dark:bg-dmsidebar dark:hover:bg-dmsidebarSecondary";
const buttonStylesDisabled = `${buttonStyles} disabled:opacity-50`;

export default function BookList({
  books,
  selectedBookId,
  onChange,
  onDelete,
  saveBook,
  canCloseSidebar = true,
}: {
  books: t.Book[];
  selectedBookId: string;
  onChange: () => void;
  onDelete: (bookid: string) => void;
  saveBook: (book: t.Book) => void;
  canCloseSidebar?: boolean;
}) {
  const dispatch = useDispatch();
  const [showPopup, setShowPopup] = React.useState(false);
  const [currentBook, setCurrentBook] = React.useState(books[0]);

  const onDeleteWrapped = (bookid) => () => deleteBook(bookid, onDelete);
  //useCallback(() => deleteBook(bookid, onDelete), [bookid]);

  const onFavoriteWrapped = (bookid) => () => favoriteBook(bookid, onChange);
  //useCallback(() => favoriteBook(bookid, onChange), [bookid]);

  const onRenameWrapped = (book) => () => startRenameBook(book);
  //useCallback(() => startRenameBook(book), [book]);

  function startRenameBook(book) {
    setCurrentBook(book);
    setShowPopup(true);
  }

  async function renameBook(book, newTitle, onChange) {
    const newBook = { ...book, title: newTitle };
    saveBook(newBook);
    setShowPopup(false);
    await onChange();
  }

  const items = books.map((book) => (
    <li key={book.bookid}>
      <ListItem
        link={`/book/${book.bookid}`}
        title={book.title}
        selected={book.bookid === selectedBookId}
        onDelete={onDeleteWrapped(book.bookid)}
        onFavorite={onFavoriteWrapped(book.bookid)}
        onRename={onRenameWrapped(book)}
        selector="booklist"
      />
    </li>
  ));

  const rightMenuItem = canCloseSidebar && {
    label: "Close",
    icon: <XMarkIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
    onClick: () => dispatch(librarySlice.actions.closeBookList()),
    className: buttonStyles,
  };

  const leftMenuItem = {
    label: "New",
    icon: <PlusIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
    onClick: () => newBook(dispatch),
    className: buttonStyles,
  };

  return (
    <>
      {showPopup && (
        <Popup
          title="Rename Book"
          inputValue={currentBook.title}
          onClose={() => setShowPopup(false)}
          onChange={(newTitle) => renameBook(currentBook, newTitle, onChange)}
        />
      )}
      <List
        title="Books"
        items={items}
        rightMenuItem={rightMenuItem}
        leftMenuItem={leftMenuItem}
        className="bg-sidebar dark:bg-dmsidebar"
      />
    </>
  );
}
