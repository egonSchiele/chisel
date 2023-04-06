import * as t from "./Types";
import React from "react";
import List from "./components/List";
import { Link } from "react-router-dom";
import Button from "./components/Button";
import { XMarkIcon } from "@heroicons/react/24/outline";
import ListMenu from "./ListMenu";
import { ListItem } from "./ListItem";

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
  async function favoriteBook(bookid: string) {
    const res = await fetch(`/api/favoriteBook`, {
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
      <ListItem
        link={`/book/${book.bookid}`}
        title={book.title}
        selected={book.bookid === selectedBookId}
        onDelete={() => deleteBook(book.bookid)}
        onFavorite={() => favoriteBook(book.bookid)}
      />
    </li>
  ));
  const newBookButton = (
    <Button className="mb-xs" rounded={true} onClick={newBook}>
      New Book...
    </Button>
  );
  const items = _items; //[newBookButton, ..._items];
  return <List title="Books" items={items} /* close={closeSidebar} */ className="bg-sidebar dark:bg-dmsidebar" />;
}
