import * as t from "./Types";
import React from "react";
import List from "./components/List";
function BookItem({ book, selected }: { book: t.Book; selected: boolean }) {
  return (
    <a href={`/book/${book.bookid}`}>
      <div
        className={`border-b p-xs border-slate-300 ${
          selected ? "bg-slate-300 rounded-md pl-sm" : "mx-xs"
        }`}
      >
        {book.title}
      </div>
    </a>
  );
}

export default function BookList({
  books,
  selectedBookId,
}: {
  books: t.Book[];
  selectedBookId: string;
}) {
  const items = books.map((book, index) => (
    <li key={book.bookid}>
      <BookItem book={book} selected={book.bookid === selectedBookId} />
    </li>
  ));
  return <List title="Books" items={items} className="bg-sidebar" />;
}
