import React, { Fragment, useEffect, useState } from "react";
import * as t from "./Types";
import "./globals.css";
import Button from "./components/Button";
/* import { Dialog, Disclosure, Popover, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  ChartPieIcon,
  CursorArrowRaysIcon,
  FingerPrintIcon,
  SquaresPlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  ChevronDownIcon,
  PhoneIcon,
  PlayCircleIcon,
  RectangleGroupIcon,
} from "@heroicons/react/20/solid"; */

export default function Library() {
  const [books, setBooks] = useState<t.Book[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    const func = async () => {
      const res = await fetch(`/books`);
      if (!res.ok) {
        setError(res.statusText);
        return;
      }
      const data = await res.json();
      console.log("got book");
      console.log(data);
      setBooks(data.books);
      setError("");
    };
    func();
  }, []);
  return (
    <header className="">
      {error && <div className="text-red-500">{error}</div>}
      <nav
        className="mx-auto mt-lg max-w-2xl items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <form className="" action="/api/newBook" method="POST">
          <h1 className="mb-sm heading">Your books</h1>
          <ul className="">
            {books &&
              books.map((book, index) => (
                <a key={index} href={`/book/${book.bookid}`}>
                  <li
                    className={
                      "border-b border-slate-400 px-2 py-2 cursor-pointer" +
                      (index % 2 === 0 ? " bg-dmlistitem1" : " bg-dmlistitem2")
                    }
                  >
                    {book.title}
                  </li>
                </a>
              ))}
          </ul>
          <Button className="rounded mt-md" buttonType="submit">
            New Book...
          </Button>
        </form>
      </nav>
    </header>
  );
}
