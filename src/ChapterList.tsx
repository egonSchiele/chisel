import * as t from "./Types";
import React from "react";
import List from "./components/List";
import { Link } from "react-router-dom";
import Button from "./components/Button";
function ChapterItem({ chapter }: { chapter: t.Chapter }) {
  return (
    <Link to={`/book/${chapter.bookid}/chapter/${chapter.chapterid}`}>
      <div className="py-xs border-b border-slate-300 hover:bg-slate-200">
        {chapter.title}
      </div>
    </Link>
  );
}

export default function ChapterList({
  chapters,
  bookid,
  onNewChapter,
}: {
  chapters: t.Chapter[];
  bookid: string;
  onNewChapter: () => void;
}) {
  const newChapter = async () => {
    const res = await fetch("/api/newChapter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bookid }),
    });
    if (!res.ok) {
      console.log("error");
      return;
    }
    await onNewChapter();
  };

  const _items = chapters.map((chapter, index) => (
    <li key={chapter.chapterid}>
      <ChapterItem chapter={chapter} />
    </li>
  ));

  const newChapterButton = (
    <Button className="mb-xs" rounded={true} onClick={newChapter}>
      New Chapter...
    </Button>
  );
  const items = [newChapterButton, ..._items];

  return <List title="Chapters" items={items} />;
}
