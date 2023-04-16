/* OLD DEPRECATED CODE */
import React, { useEffect, useRef } from "react";
import * as t from "./Types";
import Chapter from "./Chapter";
import "./globals.css";
import { Link, useNavigate, useParams } from "react-router-dom";

import produce, { current } from "immer";
import ContentEditable from "./components/ContentEditable";
import {
  Bars3BottomLeftIcon,
  ChevronLeftIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import NavButton from "./NavButton";
import { getCsrfToken, useLocalStorage } from "./utils";
import Launcher from "./Launcher";

const initialState: t.Book = {
  userid: "",
  bookid: "",
  title: "",
  author: "",
  chapterTitles: [],
  chapters: [],
  design: {
    coverColor: "bg-red-700",
    labelColor: "bg-blue-700",
    labelLinesColor: "bg-yellow-400",
  },
  columnHeadings: [],
  rowHeadings: [],

  favorite: false,
};
// import { useInterval } from "./utils";

// eslint-disable-next-line consistent-return
const reducer = produce((draft: t.Book, action: any) => {
  switch (action.type) {
    case "SET_TITLE":
      {
        const chapter = draft.chapters.find(
          (ch) => ch.chapterid === action.payload.chapterID,
        );
        if (chapter) {
          chapter.title = action.payload.newTitle;
        }
      }
      break;
    case "SET_TEXT":
      {
        const chapter = draft.chapters.find(
          (ch) => ch.chapterid === action.payload.chapterID,
        );
        if (chapter) {
          chapter.text = action.payload.newText;
        } else {
          console.log(
            "Chapter not found",
            current(draft.chapters),
            action.payload.chapterID,
          );
        }
      }
      break;
    case "SET_CHAPTER":
      draft.chapters = draft.chapters.map((ch) => {
        if (ch.chapterid === action.payload.chapterID) {
          return action.payload.chapter;
        }
        return ch;
      });

      break;
    case "SET_COVER_COLOR":
      draft.design.coverColor = action.payload;
      break;
    case "SET_LABEL_COLOR":
      draft.design.labelColor = action.payload;
      break;
    case "SET_BOOK":
      const book = { ...action.payload };
      if (!book.columnHeadings || book.columnHeadings.length === 0) {
        book.columnHeadings = Array(12).fill("");
      }
      if (!book.rowHeadings || book.rowHeadings.length === 0) {
        book.rowHeadings = Array(12).fill("");
      }
      console.log("set book", book);
      return book;

    case "SET_BOOK_TITLE":
      draft.title = action.payload;
      break;
    case "SET_COLUMN_HEADING":
      draft.columnHeadings[action.payload.i] = action.payload.newHeading;
      break;
    default:
      break;
  }
});

export default function Book({}) {
  const [state, dispatch] = React.useReducer<(state: t.Book, action: any) => any
    >(reducer, initialState);
  const [error, setError] = React.useState("");

  const [loaded, setLoaded] = React.useState(false);
  const [saved, setSaved] = React.useState(true);

  const [size, setSize] = useLocalStorage("grid_size", "medium");

  const widths = {
    small: 100,
    medium: 200,
    large: 300,
  };

  const heights = {
    small: 70,
    medium: 140,
    large: 210,
  };

  const width = widths[size];
  const height = heights[size];

  const navigate = useNavigate();

  const { bookid } = useParams();

  const zoomOut = (val) => {
    if (val === "large") {
      return "medium";
    }
    if (val === "medium") {
      return "small";
    }
    return "small";
  };

  const zoomIn = (val) => {
    if (val === "small") {
      return "medium";
    }
    if (val === "medium") {
      return "large";
    }
    return "large";
  };

  const handleKeyDown = (event) => {
    if (event.metaKey && event.key === "-") {
      event.preventDefault();
      setSize(zoomOut);
    } else if (event.metaKey && event.key === "=") {
      event.preventDefault();
      setSize(zoomIn);
    } else if (event.metaKey && event.key === "0") {
      event.preventDefault();
      setSize("medium");
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

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
    const body = JSON.stringify({ chapter, csrfToken: getCsrfToken() });

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
    const body = JSON.stringify({ book, csrfToken: getCsrfToken() });
    const result = await fetch("/api/saveBook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    if (!result.ok) {
      setError(result.statusText);
    } else {
      setError("");
    }
  }

  /*   const setCoverColor = async (e) => {
    dispatch({ type: "SET_COVER_COLOR", payload: e.target.value });
    setSaved(false);
  };

  const setLabelColor = async (e) => {
    dispatch({ type: "SET_LABEL_COLOR", payload: e.target.value });
    setSaved(false);
  };
 */
  async function deleteChapter(chapterid: string) {
    const res = await fetch(`/api/deleteChapter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chapterid, csrfToken: getCsrfToken() }),
    });
    if (!res.ok) {
      setError(res.statusText);
    }
  }

  const newChapter = async () => {
    const title = "New Chapter";
    const text = "";
    await fetch("/api/newChapter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookid,
        title,
        text,
        csrfToken: getCsrfToken(),
      }),
    });
    await fetchBook();
  };

  const cell = useRef();
  const headings = []; // ["hi", "there", "how", "are", "you"];
  console.log("state", state);
  if (!state) {
    return <div>Loading...</div>;
  }
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
    if (positions[pos] > 1) {
      const [x, y] = pos.split(",").map((n) => parseInt(n));
      stackElements.push(
        <p
          key={key++}
          className="absolute w-8 h-8 p-2 rounded-md bg-red-700 text-center content-center -m-xs text-white"
          style={{
            top: `${y * height}px`,
            left: `${x * width}px`,
          }}
        >
          {positions[pos]}
        </p>,
      );
    }
  }

  let elements = [];
  const chapterElements = [];
  key = 0;

  for (let x = 0; x < state.columnHeadings.length; x++) {
    for (let y = 0; y < state.rowHeadings.length; y++) {
      const chapters = state.chapters.filter(
        (c) => c.pos.x === x && c.pos.y === y,
      );
      if (chapters.length > 0) {
        chapters.forEach((chapter) => {
          chapterElements.push(
            <Chapter
              chapter={chapter}
              key={chapter.chapterID}
              dispatch={dispatch}
              onChange={onChange}
              // @ts-ignore
              width={width}
              // @ts-ignore
              height={height}
            />,
          );
        });
      }
      elements.push(
        <div
          key={key++}
          className=" bg-background dark:bg-dmbackground border dark:border-gray-700 border-gray-300 absolute"
          style={{
            left: `${x * width}px`,
            top: `${y * height}px`,
            height: `${height}px`,
            width: `${width}px`,
          }}
        />,
      );
    }
  }
  elements = [...elements, ...chapterElements];

  const launchItems = [
    /*
    {
      label: "Save",
      onClick: () => {
        saveBook(state);
      },
      icon: <SaveIcon className="h-4 w-4" aria-hidden="true" />,
    }, */
    {
      label: "New Chapter",
      onClick: () => {
        newChapter();
      },
      icon: <PlusIcon className="h-4 w-4" aria-hidden="true" />,
    },
    {
      label: "Back",
      onClick: () => {
        navigate(`/book/${bookid}`);
      },
      icon: <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />,
    },
  ];

  state.chapters.forEach((chapter, i) => {
    launchItems.push({
      label: chapter.title,
      onClick: () => {
        navigate(`/book/${bookid}/chapter/${chapter.chapterid}`);
      },
      icon: <Bars3BottomLeftIcon className="h-4 w-4" aria-hidden="true" />,
    });
  });

  if (!loaded) {
    if (error) {
      return (
        <p className="p-sm bg-red-700 text-white w-full">
          Error:
          {error}
        </p>
      );
    }
    return <div>Loading...</div>;
  }
  return (
    <div className="mx-auto mt-xs w-full h-full bg-background dark:bg-dmbackground items-center justify-between p-6 lg:px-8">
      {error && (
        <p className="p-sm bg-red-700 w-full">
          Error:
          {error}
        </p>
      )}
      <Launcher items={launchItems} />
      <p className="w-full uppercase text-sm dark:text-gray-500">Grid Mode</p>
      <div className="w-full text-sm dark:text-gray-300 my-xs flex">
        <Link to={`/book/${bookid}`}>
          <NavButton label="Back" onClick={() => {}}>
            <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
          </NavButton>
        </Link>

        <ContentEditable
          className="col-span-9 flex-grow text-md align-text-top"
          value={state.title}
          onSubmit={(title) => {
            dispatch({ type: "SET_BOOK_TITLE", payload: title });
            setSaved(false);
          }}
        />
      </div>

      <div className="relative w-screen h-8">
        {state.columnHeadings.map((heading, i) => (
          <ContentEditable
            key={i}
            value={heading}
            className="text-center text-sm dark:bg-dmsidebar dark:text-dmtext absolute top-0 h-full leading-8"
            style={{
              left: `${i * width}px`,
              height: `${height}px`,
              width: `${width}px`,
            }}
            onSubmit={(newHeading) => {
              dispatch({
                type: "SET_COLUMN_HEADING",
                payload: { i, newHeading },
              });
              setSaved(false);
            }}
          />
        ))}
      </div>
      <div className="relative  h-screen w-screen">
        <div className="h-screen w-screen chaptergrid ">
          {elements}
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

      {/* book.chapters.map((chapter, index) => (
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
