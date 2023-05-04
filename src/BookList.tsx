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
import sortBy from "lodash/sortBy";

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
  const uploadFileRef = React.useRef<HTMLInputElement>(null);
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
        onExport={() => {
          let title = book.title || "untitled";
          title = title.replace(/[^a-z0-9_]/gi, "-").toLowerCase();
          window.location.pathname = `/api/exportBook/${book.bookid}/${title}.zip`;
        }}
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

  async function handleUpload(x) {
    const files = x.target.files;
    const chapters = [];

    const promises = [...files].map(async (file, i) => {
      const text = await file.text();
      chapters.push({ title: file.name, text });
    });

    await Promise.all(promises);

    const res = await fd.uploadBook(chapters);
    if (res.tag === "error") {
      dispatch(librarySlice.actions.setError(res.message));
    } else {
      const book = res.payload;
      dispatch(librarySlice.actions.addBook(book));
    }
  }

  const rightMenuItem = canCloseSidebar && {
    label: "Close",
    icon: <XMarkIcon className="w-6 h-6 xl:w-5 xl:h-5" />,
    onClick: close,
    className: buttonStyles,
    animate: true,
  };

  const newMenuItem = {
    label: "New",
    icon: <PlusIcon className="w-6 h-6 xl:w-5 xl:h-5" />,
    onClick: () => newBook(),
    className: buttonStyles,
    showSpinner: true,
    animate: true,
  };

  const dropdownMenuItems = [
    {
      label: "Import Book",
      icon: <PlusIcon className="w-6 h-6 xl:w-5 xl:h-5" />,
      onClick: () => {
        uploadFileRef.current.click();
      },
      className: buttonStyles,
    },
  ];

  const dropdownMenu = {
    label: "Menu",
    icon: (
      <ListMenu
        items={dropdownMenuItems}
        label="Book Menu"
        selector="book-menu"
        className="-translate-x-1/4"
        buttonClassName="ml-xs"
      />
    ),
    onClick: () => {},
    className: buttonStyles,
  };

  let leftMenuItem = [newMenuItem, dropdownMenu];

  const upload = (
    <input
      type="file"
      id="imgupload"
      className="hidden"
      key="upload"
      ref={uploadFileRef}
      onChange={handleUpload}
    />
  );

  return (
    <>
      <List
        title="Books"
        items={[upload, ...items]}
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
