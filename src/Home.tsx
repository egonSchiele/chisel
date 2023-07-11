import List from "./components/List";
import ListItem from "./components/ListItem";
import { Link, useNavigate } from "react-router-dom";
import React, { useContext, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getSelectedChapter } from "./reducers/librarySlice";
import { RootState } from "./store";
import { useLocalStorage, getChapterText } from "./utils";
import * as t from "./Types";
import { useColors } from "./lib/hooks";
import LibraryContext from "./LibraryContext";
import Input from "./components/Input";
import Button from "./components/Button";
function PinnedChapters() {
  const state: t.State = useSelector((state: RootState) => state.library);
  const pinnedChapters = useSelector((_: RootState) => {
    const chapters = [];
    state.books.forEach((book) => {
      book.chapters.forEach((chapter) => {
        if (chapter.pinToHome) chapters.push(chapter);
      });
    });
    return chapters;
  });
  const colors = useColors();
  const items = pinnedChapters.map((chapter) => {
    const book = state.books.find((book) => book.bookid === chapter.bookid);
    if (!book) return null;
    return (
      <ListItem
        key={chapter.chapterid}
        title={`${book.title}/${chapter.title}`}
        selected={false}
        link={`/book/${chapter.bookid}/chapter/${chapter.chapterid}`}
      />
    );
  });

  if (items.length === 0) return null;

  return (
    <List title="Pinned Chapters" items={items} className="!w-72 !h-min" />
  );
}

function Welcome() {
  const { settings, setSettings } = useContext(
    LibraryContext
  ) as t.LibraryContextType;

  const [message, setMessage] = useState("");

  return (
    <div className="fontsize-18">
      <h1 className="text-2xl font-semibold">Welcome to Chisel!</h1>

      <pre className="typography  mt-sm">
        Start by clicking the plus sign on the left to create a new book. If
        you'd like to indulge in the marvels of artificial intelligence, you'll
        need to add your OpenAI key here:
      </pre>
      <Input
        title="Your key"
        name="customKey"
        className="w-72 mt-md mb-xs"
        value={settings.customKey}
        onChange={(e) => {
          setSettings({ ...settings, customKey: e.target.value });
          setMessage("");
        }}
      />
      <Button
        size="small"
        onClick={() => {
          setMessage("Key added!");
        }}
        style="secondary"
      >
        Add
      </Button>
      {message && (
        <pre className="typography mt-sm text-blue-500">{message}</pre>
      )}
      <pre className="typography mt-sm markdown">
        Or you can{" "}
        <a href="https://egonschiele.github.io/chisel-docs/docs/advanced-features/own-key">
          add it from the settings panel.
        </a>
      </pre>
      <pre className="typography mt-sm markdown">
        Seeking further enlightenment and wisdom?{" "}
        <a href="https://egonschiele.github.io/chisel-docs/">
          Read the full docs
        </a>
        .
      </pre>
      <pre className="typography mt-sm">I hope you enjoy your stay!</pre>
      <pre className="typography mt-sm">- Adit</pre>
    </div>
  );
}

export default function Home() {
  const state = useSelector((state: RootState) => state.library);
  const { settings } = useContext(LibraryContext) as t.LibraryContextType;

  const dispatch = useDispatch();

  return (
    <div className="ml-xl pl-md w-[50rem]">
      <div className="grid grid-cols-1 mx-auto w-[30rem] xl:w-[50rem]">
        <Welcome />
        <PinnedChapters />
      </div>
    </div>
  );
}
