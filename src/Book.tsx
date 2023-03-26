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
import Button from "./components/Button";
import EditableInput from "./components/EditableInput";
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
      dispatch({ type: "SET_BOOK", payload: data });
      setLoaded(true);
    };
    func();
  }, []);

  useEffect(() => {
    if (saved) return;
    saveBook(state);
    setSaved(true);
  }, [saved]);

  async function saveBook(state: t.Book) {
    const body = JSON.stringify({ book: state });
    console.log("hihihi");
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

  if (!loaded) return <div>Loading...</div>;
  console.log("state", state);
  return (
    <div className="mx-auto mt-lg max-w-2xl items-center justify-between p-6 lg:px-8">
      {error && <p className="p-sm bg-red-400 w-full">Error: {error}</p>}

      <form className="" action="/api/newBook" method="POST">
        <EditableInput
          value={state.title}
          onSubmit={(title) => {
            dispatch({ type: "SET_BOOK_TITLE", payload: title });
            setSaved(false);
          }}
        >
          <h1 className="mb-sm heading">{state.title}</h1>
        </EditableInput>
        <ul className="">
          {loaded &&
            state.chapters.map((chapter, index) => (
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
            ))}
        </ul>
        <Button className="rounded mt-md" buttonType="submit">
          New Chapter...
        </Button>
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
