import { PlusIcon } from "@heroicons/react/24/outline";
import sortBy from "lodash/sortBy";
import React, { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import LibraryContext from "./LibraryContext";
import List from "./components/List";
import ListItem from "./components/ListItem";
import ListMenu from "./components/ListMenu";
import * as fd from "./lib/fetchData";
import { librarySlice } from "./reducers/librarySlice";
import { RootState } from "./store";

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

export default function BookList() {
  const books = useSelector((state: RootState) => state.library.books);
  const selectedBookId = useSelector(
    (state: RootState) => state.library.selectedBookId
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { newBook, saveBook } = useContext(LibraryContext) as any;

  function onDelete(deletedBookid) {
    dispatch(librarySlice.actions.deleteBook(deletedBookid));
    if (deletedBookid === selectedBookId) {
      dispatch(librarySlice.actions.noBookSelected());
      navigate("/");
    }
  }

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

    dispatch(librarySlice.actions.loading());
    const res = await fd.uploadBook(chapters);
    dispatch(librarySlice.actions.loaded());
    if (res.tag === "error") {
      dispatch(librarySlice.actions.setError(res.message));
    } else {
      const book = res.payload;
      dispatch(librarySlice.actions.addBook(book));
    }
  }

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

  const leftMenuItem = {
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

  let rightMenuItem = newMenuItem;

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
  // Account for compost heap book, which is always there
  const booksLength = books.length - 1;

  let bookCountTitle = `${booksLength} books`;
  if (booksLength === 1) {
    bookCountTitle = "1 book";
  } else if (booksLength === 0) {
    bookCountTitle = "No books";
  }

  return (
    <>
      <List
        title={bookCountTitle}
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
