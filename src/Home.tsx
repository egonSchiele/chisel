import List from "./components/List";
import ListItem from "./components/ListItem";
import { Link, useNavigate } from "react-router-dom";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { getSelectedChapter } from "./reducers/librarySlice";
import { RootState } from "./store";
import { useLocalStorage, getChapterText } from "./utils";
import * as t from "./Types";
import { useColors } from "./lib/hooks";
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

export default function Home() {
  const state = useSelector((state: RootState) => state.library);

  const dispatch = useDispatch();

  return (
    <div className="grid grid-cols-4 mx-md">
      <PinnedChapters />
    </div>
  );
}
