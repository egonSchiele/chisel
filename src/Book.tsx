/* OLD DEPRECATED CODE */
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
  design: {
    coverColor: "bg-red-700",
    labelColor: "bg-blue-700",
    labelLinesColor: "bg-yellow-400",
  },
  columnHeadings: [],
  favorite: false,
};

import produce, { current } from "immer";
import Button from "./components/Button";
import EditableInput from "./components/EditableInput";
import { TrashIcon } from "@heroicons/react/24/solid";
import Select from "./components/Select";
import ContentEditable from "./components/ContentEditable";
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
    case "SET_COVER_COLOR":
      draft.design.coverColor = action.payload;
      break;
    case "SET_LABEL_COLOR":
      draft.design.labelColor = action.payload;
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

  const fetchBook = async () => {
    const res = await fetch(`/api/book/${bookid}`, { credentials: "include" });
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

    if (!data.design) {
      data.design = {
        coverColor: "bg-dmlistitem2",
        labelColor: "bg-blue-700",
        labelLinesColor: "border-yellow-400",
      };
    }
    dispatch({ type: "SET_BOOK", payload: data });
    setLoaded(true);
  };
  useEffect(() => {
    fetchBook();
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

  const setCoverColor = async (e) => {
    dispatch({ type: "SET_COVER_COLOR", payload: e.target.value });
    setSaved(false);
  };

  const setLabelColor = async (e) => {
    dispatch({ type: "SET_LABEL_COLOR", payload: e.target.value });
    setSaved(false);
  };

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

  const newChapter = async (event) => {
    if (event.metaKey) {
      event.preventDefault();
      await fetch("/api/newChapter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookid }),
      });
      await fetchBook();
    } else {
    }
  };

  const cell = useRef();
  const headings = []; // ["hi", "there", "how", "are", "you"];
  console.log("state", state);

  const positions = {};
  state.chapters.forEach((chapter, i) => {
    const key = [chapter.pos.x, chapter.pos.y].toString();
    if (!positions[key]) {
      positions[key] = 0;
    }

    positions[key] += 1;
  });

  const stackElements = [];

  let key = 0;
  for (const pos in positions) {
    console.log("pos", pos, positions[pos]);
    if (positions[pos] > 1) {
      const [x, y] = pos.split(",").map((n) => parseInt(n));
      stackElements.push(
        <p
          key={key++}
          className="absolute w-8 h-8 p-2 rounded-md bg-red-700 text-center content-center -m-xs"
          style={{
            top: `${y * 147}px`,
            left: `${x * 222}px`,
          }}
        >
          {positions[pos]}
        </p>
      );
    }
  }

  if (!loaded) {
    if (error) {
      return (
        <p className="p-sm bg-red-700 text-white w-full">Error: {error}</p>
      );
    }
    return <div>Loading...</div>;
  }
  return (
    <div className="mx-auto mt-xs w-full h-full bg-dmbackground items-center justify-between p-6 lg:px-8">
      {error && <p className="p-sm bg-red-700 w-full">Error: {error}</p>}

        <ContentEditable
          className="col-span-9"
          value={state.title}
          onSubmit={(title) => {
            dispatch({ type: "SET_BOOK_TITLE", payload: title });
            setSaved(false);
          }}
        />
   
   
      <div className="relative w-screen h-6">
        {headings.map((heading, i) => {
          return (
            <p
              key={i}
              className="text-center uppercase w-chapter dark:bg-dmsidebar dark:text-dmtext absolute top-0"
              style={{
                left: `${i * 222}px`,
              }}
            >
              {heading}
            </p>
          );
        })}
      </div>
      <div className="relative  h-screen w-screen">
        <div className="w-screen h-screen chaptergrid">
          {state.chapters.map((chapter, index) => (
            <Chapter
              chapter={chapter}
              key={index}
              dispatch={dispatch}
              onChange={onChange}
              // @ts-ignore
              width={222}
              // @ts-ignore
              height={147}
            />
          ))}
          {stackElements}
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
