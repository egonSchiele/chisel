import React, { Fragment, useEffect, useState } from "react";
import * as t from "./Types";
import "./globals.css";
import Button from "./components/Button";
import { TrashIcon } from "@heroicons/react/24/solid";
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

  async function deleteBook(bookid: string) {
    const res = await fetch(`/api/deleteBook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bookid }),
    });
    if (!res.ok) {
      setError(res.statusText);
      return;
    }
  }

  return (
    <header className="">
      {error && <div className="text-red-500">{error}</div>}
      <nav
        className="mx-auto mt-lg max-w-2xl items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <form className="" action="/api/newBook" method="POST">
          <h1 className="mb-sm heading">Your books</h1>
          <div className="grid grid-cols-4 gap-4">
            {books &&
              books.map((book, index) => (
                <div>
                  <div>
                    <a key={index} href={`/book/${book.bookid}`}>
                      <div
                        className={
                          "bg-blue-700 hover:bg-blue-500 h-48 rounded-md grid grid-rows-5 " +
                          (book.design && book.design.coverColor
                            ? book.design.coverColor
                            : "bg-dmlistitem2")
                        }
                      >
                        <div></div>
                        <p
                          className={
                            `col-span-2 px-2 py-2 my-auto border-t-2 border-b-2 text-center  border-yellow-400 font-georgia ` +
                            (book.design && book.design.labelColor
                              ? book.design.labelColor
                              : "bg-red-700")
                          }
                        >
                          {book.title}
                        </p>
                      </div>
                    </a>
                  </div>
                  <div className="relative mt-xs">
                    <p className="mr-xs">{book.title}</p>
                    <TrashIcon
                      className="w-6 ml-xs absolute top-0 right-0 cursor-pointer hover:text-white"
                      onClick={() => deleteBook(book.bookid)}
                    />
                  </div>
                </div>
              ))}
          </div>
          <Button className="rounded mt-md" buttonType="submit">
            New Book...
          </Button>
        </form>
      </nav>
    </header>
  );
}
