import React, { Fragment, useEffect, useState } from "react";
import * as t from "./Types";
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
    <header className="relative isolate z-10 bg-white">
      {error && <div className="text-red-500">{error}</div>}
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <form
            className="flex w-full lg:max-w-md"
            action="/api/newBook"
            method="POST"
          >
            <ul>
              {books &&
                books.map((book, index) => (
                  <li key={index}>
                    <a href={`/book/${book.bookid}`}>{book.title}</a>
                  </li>
                ))}
            </ul>
            <button
              type="submit"
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              New Book... <span aria-hidden="true">&rarr;</span>
            </button>
          </form>
        </div>
      </nav>
    </header>
  );
}
