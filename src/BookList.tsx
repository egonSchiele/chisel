import React from "react";
import { Link } from "react-router-dom";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import * as t from "./Types";
import List from "./components/List";
import Button from "./components/Button";
import ListMenu from "./ListMenu";
import ListItem from "./ListItem";
import Popup from "./Popup";
import { getCsrfToken } from "./utils";
import * as fd from "./fetchData";

async function deleteBook(bookid: string, onChange) {
  const res = await fd.deleteBook(bookid);
  if (res.tag === "error") {
    console.log(res.message);
    return;
  }
  await onChange();
}

async function favoriteBook(bookid: string, onChange) {
  const res = await fd.favoriteBook(bookid);
  if (res.tag === "error") {
    console.log(res.message);
    return;
  }

  await onChange();
}

async function newBook(onNewBook) {
  const res = await fd.newBook();
  if (res.tag === "error") {
    console.log(res.message);
  } else {
    const book = res.payload;
    console.log("new book", book);
    await onNewBook(book);
  }
}

const buttonStyles = "bg-sidebar hover:bg-sidebarSecondary dark:bg-dmsidebar dark:hover:bg-dmsidebarSecondary";
const buttonStylesDisabled = `${buttonStyles} disabled:opacity-50`;

export default function BookList({
  books,
  selectedBookId,
  onChange,
  onNewBook,
  closeSidebar,
  saveBook,
  canCloseSidebar = true,
}: {
  books: t.Book[];
  selectedBookId: string;
  onChange: () => void;
  onNewBook: (book: t.Book) => void;
  closeSidebar: () => void;
  saveBook: (book: t.Book) => void;
  canCloseSidebar?: boolean;
}) {
  const [showPopup, setShowPopup] = React.useState(false);
  const [currentBook, setCurrentBook] = React.useState(books[0]);

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
        onDelete={() => deleteBook(book.bookid, onChange)}
        onFavorite={() => favoriteBook(book.bookid, onChange)}
        onRename={() => startRenameBook(book)}
        selector="booklist"
      />
    </li>
  ));

  const rightMenuItem = canCloseSidebar && {
    label: "Close",
    icon: <XMarkIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
    onClick: closeSidebar,
    className: buttonStyles,
  };

  const leftMenuItem = {
    label: "New",
    icon: <PlusIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
    onClick: () => newBook(onNewBook),
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
