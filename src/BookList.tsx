import * as t from "./Types";
import React from "react";
import List from "./components/List";
import { Link } from "react-router-dom";
import Button from "./components/Button";
import { XMarkIcon } from "@heroicons/react/24/outline";
function BookItem({
  book,
  selected,
  onDelete,
}: {
  book: t.Book;
  selected: boolean;
  onDelete: () => void;
}) {
  const selectedCss = selected ? "bg-listitemhover dark:bg-dmlistitemhover" : "";
  return (
    <div
      className={`flex py-xs border-b text-slate-300 border-listBorder dark:border-dmlistBorder hover:bg-listitemhover dark:hover:bg-dmlistitemhover ${selectedCss}`}
    >
      <div className="flex flex-grow">
        <Link to={`/book/${book.bookid}`}>
          <div>{book.title}</div>
        </Link>
      </div>
      <div
        className="flex flex-none cursor-pointer items-center mr-xs"
        onClick={onDelete}
      >
        <XMarkIcon className="w-4 h-4 text-slate-400" />
      </div>
    </div>
  );
}

export default function BookList({
  books,
  selectedBookId,
  onChange,
  closeSidebar,
}: {
  books: t.Book[];
  selectedBookId: string;
  onChange: () => void;
  closeSidebar: () => void;
}) {
  async function deleteBook(bookid: string) {
    const res = await fetch(`/api/deleteBook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bookid }),
    });
    if (!res.ok) {
      console.log(res.statusText);
      return;
    }
    await onChange();
  }

  const newBook = async () => {
    const res = await fetch("/api/newBook", {
      method: "POST",
    });
    if (!res.ok) {
      console.log("error");
      return;
    }
    await onChange();
  };

  const _items = books.map((book, index) => (
    <li key={book.bookid}>
      <BookItem
        book={book}
        selected={book.bookid === selectedBookId}
        onDelete={() => deleteBook(book.bookid)}
      />
    </li>
  ));
  const newBookButton = (
    <Button className="mb-xs" rounded={true} onClick={newBook}>
      New Book...
    </Button>
  );
  const items = [newBookButton, ..._items];
  return <List title="Books" items={items} close={closeSidebar} className="bg-sidebar dark:bg-dmsidebar" />;
}
