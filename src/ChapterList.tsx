import * as t from "./Types";
import React from "react";
import List from "./components/List";
import { Link } from "react-router-dom";
import Button from "./components/Button";
import { EllipsisHorizontalIcon, XMarkIcon } from "@heroicons/react/24/outline";
import ChapterListMenu from "./ChapterListMenu";
function ChapterItem({
  chapter,
  selected,
  onDelete,
  onFavorite,
}: {
  chapter: t.Chapter;
  selected: boolean;
  onDelete: () => void;
  onFavorite: () => void;
}) {
  const selectedCss = selected ? "bg-listitemhoverSecondary dark:bg-dmlistitemhoverSecondary" : "";
  return (
    <div
      className={`flex py-xs border-b text-slate-300 border-listBorder dark:border-dmlistBorder hover:bg-listitemhoverSecondary dark:hover:bg-dmlistitemhoverSecondary ${selectedCss}`}
    >
      {" "}
      <div className="flex flex-grow">
        <Link to={`/book/${chapter.bookid}/chapter/${chapter.chapterid}`}>
          <div className="px-xs">{chapter.title}</div>
        </Link>
      </div>
      <div
        className="flex flex-none cursor-pointer items-center mr-xs hover:bg-slate-500 rounded-md p-2"
      >
        <ChapterListMenu onFavorite={onFavorite} onDelete={onDelete} />
{/*         <EllipsisHorizontalIcon className="w-4 h-4 text-slate-400" /> */}
      </div>
    </div>
  );
}


export default function ChapterList({
  chapters,
  bookid,
  selectedChapterId,
  onChange,
  closeSidebar,
}: {
  chapters: t.Chapter[];
  bookid: string;
  selectedChapterId: string;
  onChange: () => void;
  closeSidebar: () => void;
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

  async function favoriteChapter(chapterid: string) {
    const res = await fetch(`/api/favoriteChapter`, {
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

  const sublist = (title, chapters: t.Chapter[]) => {
    const items = chapters.map((chapter, index) => (
      <li key={chapter.chapterid}>
        <ChapterItem
          chapter={chapter}
          selected={chapter.chapterid === selectedChapterId}
          onDelete={() => deleteChapter(chapter.chapterid)}
          onFavorite={() => favoriteChapter(chapter.chapterid)}
        />
      </li>
    ));
    return <List title={title} items={items} className="p-0 m-0 border-0 text-lg pt-0 pl-0 border-r-0 mb-md" />
  }

  const favoriteChapters = chapters.filter((chapter) => chapter.favorite);
  const otherChapters = chapters.filter((chapter) => !chapter.favorite);


  const lists = [];

  if (favoriteChapters.length > 0) {
    lists.push(sublist("Favorites", favoriteChapters));
  }
    lists.push(sublist("All", otherChapters));
    return <List title="Chapters" items={lists} close={closeSidebar} className="bg-sidebarSecondary dark:bg-dmsidebarSecondary" />;
  
  

/* 
  const newChapterButton = (
    <Button className="mb-xs" rounded={true} onClick={newChapter}>
      New Chapter...
    </Button>
  );
  const items = _items; //[newChapterButton, ..._items]; */

}
