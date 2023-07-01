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
import { LibraryContextType } from "./Types";
import { useColors } from "./lib/hooks";

async function deleteBook(bookid: string, onDelete) {
  const res = await fd.deleteBook(bookid);
  if (res.tag === "error") {
    console.log(res.message);
    return;
  }
  onDelete(bookid);
}

const buttonStyles = ""; //"bg-sidebar hover:bg-sidebarSecondary dark:bg-dmsidebar dark:hover:bg-dmsidebarSecondary";
const buttonStylesDisabled = `${buttonStyles} disabled:opacity-50`;

export default function BookList({ cachedBooks = null }) {
  const books = useSelector((state: RootState) => state.library.books);
  const loaded = useSelector((state: RootState) => state.library.booksLoaded);
  const selectedBookId = useSelector(
    (state: RootState) => state.library.selectedBookId
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { newBook, saveBook } = useContext(
    LibraryContext
  ) as LibraryContextType;

  const colors = useColors();

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

  if (!loaded) {
    if (cachedBooks) {
      const compostBook = cachedBooks.find((book) => book.tag === "compost");
      const otherBooks = sortBy(
        cachedBooks.filter((book) => book.tag !== "compost"),
        ["title"]
      );
      const items = otherBooks.map((book) => (
        <ListItem
          key={book.bookid}
          title={book.title}
          link={`/book/${book.bookid}`}
          selected={false}
        />
      ));
      if (compostBook) {
        items.unshift(
          <ListItem
            key={compostBook.bookid}
            title={compostBook.title}
            link={`/book/${compostBook.bookid}`}
            selected={false}
            className="flex pb-xs border-b border-gray-300 dark:border-gray-700 mb-xs"
            tag={"compost"}
          />
        );
      }
      return (
        <List
          title="Loading Books"
          items={items}
          className={`p-xs h-screen no-scrollbar w-full ${colors.backgroundAlt}`}
        />
      );
    } else {
      <div
        className={`p-xs h-screen no-scrollbar dark:[color-scheme:dark] overflow-y-auto overflow-x-hidden w-full bg-gray-500 animate-pulse`}
      />;
    }
  }

  const compostBook = books.find((book) => book.tag === "compost");
  const otherBooks = sortBy(
    books.filter((book) => book.tag !== "compost"),
    ["title"]
  );

  function bookListItem(book, tag: string | null = null) {
    const menuItems = [
      { label: "Delete", onClick: () => deleteBook(book.bookid, onDelete) },
      { label: "Rename", onClick: () => startRenameBook(book) },
      {
        label: "Export",
        onClick: () => {
          let title = book.title || "untitled";
          title = title.replace(/[^a-z0-9_]/gi, "-").toLowerCase();
          window.location.pathname = `/api/exportBook/${book.bookid}/${title}.zip`;
        },
      },
    ];
    return (
      <ListItem
        link={`/book/${book.bookid}`}
        title={book.title}
        selected={book.bookid === selectedBookId}
        selector={tag ? `booklist-${tag}` : "booklist"}
        menuItems={menuItems}
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
    dispatch(librarySlice.actions.closeFileNavigator());
  }

  function open() {
    dispatch(librarySlice.actions.openFileNavigator());
  }

  async function handleUpload(x) {
    const files = x.target.files;
    const chapters: { title: string; text: string }[] = [];

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
    label: "New Book",
    icon: <PlusIcon className="w-5 h-5" />,
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
        if (uploadFileRef.current) uploadFileRef.current.click();
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
        className={`-translate-x-1/4`}
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
  let booksLength = books.length - 1;
  if (booksLength < 0) booksLength = 0;
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
        /* className={colors.backgroundAlt} */
        /* swipeToClose="left"
        close={close} */
        open={open}
      />
    </>
  );
}
