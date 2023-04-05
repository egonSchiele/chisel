import * as t from "./Types";
import React from "react";
import List from "./components/List";
import { Link } from "react-router-dom";
import Button from "./components/Button";
import { XMarkIcon } from "@heroicons/react/24/outline";
function ChapterItem({
  chapter,
  selected,
  onDelete,
}: {
  chapter: t.Chapter;
  selected: boolean;
  onDelete: () => void;
}) {
  const selectedCss = selected ? "bg-listitemhoverSecondary dark:bg-dmlistitemhoverSecondary" : "";
  return (
    <div
      className={`flex py-xs border-b text-slate-300 border-listBorder dark:border-dmlistBorder hover:bg-listitemhoverSecondary dark:hover:bg-dmlistitemhoverSecondary ${selectedCss}`}
    >
      {" "}
      <div className="flex flex-grow">
        <Link to={`/book/${chapter.bookid}/chapter/${chapter.chapterid}`}>
          <div>{chapter.title}</div>
        </Link>
      </div>
      <div
        className="flex flex-none cursor-pointer items-center mr-xs"
        onClick={onDelete}
      >
        <XMarkIcon className="w-4 h-4 text-slate-400" />
      </div>
    </div>
  );
}

export default function ChapterList({
  chapters,
  bookid,
  selectedChapterId,
  onChange,
}: {
  chapters: t.Chapter[];
  bookid: string;
  selectedChapterId: string;
  onChange: () => void;
}) {
  async function deleteChapter(chapterid: string) {
    const res = await fetch(`/api/deleteChapter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chapterid }),
    });
    if (!res.ok) {
      console.log(res.statusText);
      return;
    }
    onChange();
  }

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
    await onChange();
  };

  const _items = chapters.map((chapter, index) => (
    <li key={chapter.chapterid}>
      <ChapterItem
        chapter={chapter}
        selected={chapter.chapterid === selectedChapterId}
        onDelete={() => deleteChapter(chapter.chapterid)}
      />
    </li>
  ));

  const newChapterButton = (
    <Button className="mb-xs" rounded={true} onClick={newChapter}>
      New Chapter...
    </Button>
  );
  const items = [newChapterButton, ..._items];

  return <List title="Chapters" items={items} className="bg-sidebarSecondary dark:bg-dmsidebarSecondary" />;
}
