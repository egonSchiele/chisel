import * as t from "./Types";
import React from "react";
import List from "./components/List";
import { Link } from "react-router-dom";
import Button from "./components/Button";
function BookItem({ book, selected }: { book: t.Book; selected: boolean }) {
  return (
    <Link to={`/book/${book.bookid}`}>
      <div
        className={`border-b p-xs border-slate-300 ${
          selected ? "bg-slate-300 rounded-md pl-sm" : "mx-xs"
        }`}
      >
        {book.title}
      </div>
    </Link>
  );
}

export default function BookList({
  books,
  selectedBookId,
  onNewBook,
}: {
  books: t.Book[];
  selectedBookId: string;
  onNewBook: () => void;
}) {
  const newBook = async () => {
    const res = await fetch("/api/newBook", {
      method: "POST",
    });
    if (!res.ok) {
      console.log("error");
      return;
    }
    await onNewBook();
  };

  const _items = books.map((book, index) => (
    <li key={book.bookid}>
      <BookItem book={book} selected={book.bookid === selectedBookId} />
    </li>
  ));
  const newBookButton = (
    <Button className="mb-xs" rounded={true} onClick={newBook}>
      New Book...
    </Button>
  );
  const items = [newBookButton, ..._items];
  return <List title="Books" items={items} className="bg-sidebar" />;
}
