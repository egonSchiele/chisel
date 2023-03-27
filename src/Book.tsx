import React, { useEffect, useRef } from "react";
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
import Button from "./components/Button";
import EditableInput from "./components/EditableInput";
import { TrashIcon } from "@heroicons/react/24/solid";
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
    case "SET_CHAPTER":
      draft.chapters = draft.chapters.map((ch) => {
        if (ch.chapterid === action.payload.chapterID) {
          return action.payload.chapter;
        } else {
          return ch;
        }
      });

      break;

    case "SET_BOOK":
      return action.payload;
      break;
    case "SET_BOOK_TITLE":
      draft.title = action.payload;

      break;

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
  const [saved, setSaved] = React.useState(true);

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
      if (!data) {
        setError("Book not found");
        return;
      }
      dispatch({ type: "SET_BOOK", payload: data });
      setLoaded(true);
    };
    func();
  }, []);

  async function saveChapter(chapter) {
    const body = JSON.stringify({ chapter });

    const result = await fetch("/api/saveChapter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    if (!result.ok) {
      console.log("error saving chapter", result.statusText);
    }
  }

  const onChange = async (chapter: t.Chapter) => {
    dispatch({
      type: "SET_CHAPTER",
      payload: { chapter, chapterID: chapter.chapterid },
    });
    await saveChapter(chapter);
  };

  useEffect(() => {
    if (saved) return;
    saveBook(state);
    setSaved(true);
  }, [saved]);

  async function saveBook(state: t.Book) {
    const book = { ...state };

    console.log("saving book", book);
    book.chapters = [];
    const body = JSON.stringify({ book });
    const result = await fetch("/api/saveBook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    if (!result.ok) {
      setError(result.statusText);
      return;
    } else {
      setError("");
    }
  }

  async function deleteChapter(chapterid: string) {
    const res = await fetch(`/api/deleteChapter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chapterid }),
    });
    if (!res.ok) {
      setError(res.statusText);
      return;
    }
  }

  const cell = useRef();

  console.log("state", state);

  if (!loaded) {
    if (error) {
      return (
        <p className="p-sm bg-red-700 text-white w-full">Error: {error}</p>
      );
    }
    return <div>Loading...</div>;
  }
  return (
    <div className="mx-auto mt-xs w-full h-full bg-blue-700 items-center justify-between p-6 lg:px-8">
      {error && <p className="p-sm bg-red-400 w-full">Error: {error}</p>}

      <form
        className="grid grid-cols-10 mb-sm"
        action="/api/newChapter"
        method="POST"
      >
        <input type="hidden" name="bookid" value={state.bookid} />
        <EditableInput
          className="col-span-9"
          value={state.title}
          onSubmit={(title) => {
            dispatch({ type: "SET_BOOK_TITLE", payload: title });
            setSaved(false);
          }}
        >
          <h1 className="mb-sm heading">{state.title}</h1>
        </EditableInput>
        <Button className="col-span-1 rounded mt-md" buttonType="submit">
          New Chapter...
        </Button>
      </form>
      <div className="relative  h-screen w-screen">
        <div className="w-screen h-screen chaptergrid">
          {state.chapters.map((chapter, index) => (
            <Chapter
              chapter={chapter}
              key={index}
              dispatch={dispatch}
              onChange={onChange}
              // @ts-ignore
              width={100}
              // @ts-ignore
              height={50}
            />
          ))}
        </div>
      </div>
      {/*  <ul className="">
          {loaded &&
            state.chapters.map((chapter, index) => (
              <div className="relative">
                <a key={index} href={`/chapter/${chapter.chapterid}`}>
                  <li
                    className={
                      "border-b border-slate-400 px-2 py-2 cursor-pointer" +
                      (index % 2 === 0 ? " bg-dmlistitem1" : " bg-dmlistitem2")
                    }
                  >
                    {chapter.title}
                  </li>
                </a>
                <TrashIcon
                  className="w-6 m-2 absolute top-0 right-0 cursor-pointer hover:text-white"
                  onClick={() => deleteChapter(chapter.chapterid)}
                />
              </div>
            ))}
        </ul> */}

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
