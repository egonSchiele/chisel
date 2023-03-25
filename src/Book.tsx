import React, { useEffect } from "react";
import * as t from "./Types";
import Chapter from "./Chapter";
import "./globals.css";
import { useParams } from "react-router-dom";

const initialState: t.Book = {
  userid: "",
  bookid: "",
  title: "",
  author: "",
  chapters: [],
};

import produce, { current } from "immer";
//import { useInterval } from "./utils";

let reducer = produce((draft: t.Book, action: any) => {
  switch (action.type) {
    case "SET_TITLE":
      {
        const chapter = draft.chapters.find(
          (ch) => ch.chapterid === action.payload.chapterID
        );
        if (chapter) {
          chapter.title = action.payload.newTitle;
        }
      }
      break;
    case "SET_TEXT":
      {
        const chapter = draft.chapters.find(
          (ch) => ch.chapterid === action.payload.chapterID
        );
        if (chapter) {
          chapter.text = action.payload.newText;
        } else {
          console.log(
            "Chapter not found",
            current(draft.chapters),
            action.payload.chapterID
          );
        }
      }
      break;
    case "SET_BOOK":
      return action.payload;

    default:
      break;
  }
});

export default function Book({}) {
  const [state, dispatch] = React.useReducer<
    (state: t.Book, action: any) => any
  >(reducer, initialState);
  const [error, setError] = React.useState("");

  const [loaded, setLoaded] = React.useState(false);

  const { bookid } = useParams();
  useEffect(() => {
    const func = async () => {
      const res = await fetch(`/api/book/${bookid}`);
      if (!res.ok) {
        setError(res.statusText);
        return;
      }
      const data: t.Book = await res.json();
      console.log("got book");
      console.log(data);
      dispatch({ type: "SET_BOOK", payload: data });
      setLoaded(true);
    };
    func();
  }, []);
  return (
    <div className="m-sm">
      {error && <p className="p-sm bg-red-400 w-full">Error: {error}</p>}

      {bookid}
      <h1>{state.title}</h1>
      <p>{state.chapters.length} chapters</p>
      <ul>
        {state.chapters.map((chapter, index) => (
          <li key={index}>
            <a href={`/chapter/${chapter.chapterid}`}>
              {chapter.title} - {chapter.text}
            </a>
          </li>
        ))}
      </ul>
      <form
        className="flex w-full lg:max-w-md"
        action="/api/newChapter"
        method="POST"
      >
        <input type="hidden" name="bookid" value={bookid} />
        <button
          type="submit"
          className="text-sm font-semibold leading-6 text-gray-900"
        >
          New Chapter... <span aria-hidden="true">&rarr;</span>
        </button>
      </form>
      {/*book.chapters.map((chapter, index) => (
        /*        <div
          key={cindex}
          className="rounded-lg w-56 h-full odd:bg-gray-300 even:bg-gray-100 mr-md shadow-sm"
        > */
      /*  <div key={index} className="px-2 py-5">
          <Chapter
            key={index}
            chapterid={chapter.chapterid}
            title={chapter.title}
            text={chapter.text}
            x={250 * chapter.pos.x}
            y={10 * chapter.pos.y}
          />
        </div>
      )) */}
    </div>
  );
}
