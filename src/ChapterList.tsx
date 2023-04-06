import * as t from "./Types";
import React from "react";
import List from "./components/List";
import { Link } from "react-router-dom";
import Button from "./components/Button";
import { EllipsisHorizontalIcon, XMarkIcon } from "@heroicons/react/24/outline";
import ListMenu from "./ListMenu";
import { ListItem } from "./ListItem";


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
    console.log("delete chapter", chapterid);
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
    console.log("favorite chapter", chapterid);
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
        <ListItem
          
          link={`/book/${chapter.bookid}/chapter/${chapter.chapterid}`}
          title={chapter.title}
          selected={chapter.chapterid === selectedChapterId}
          onDelete={() => deleteChapter(chapter.chapterid)}
          onFavorite={() => favoriteChapter(chapter.chapterid)}
        />
      </li>
    ));
    return <List title={title} items={items} level={2} className="p-0 m-0 border-0 text-lg pt-0 pl-0 border-r-0 mb-sm" />
  }

  const favoriteChapters = chapters.filter((chapter) => chapter.favorite);
  const otherChapters = chapters.filter((chapter) => !chapter.favorite);

console.log(favoriteChapters, "FAVORITE CHAPTERS");
  const lists = [];

  if (favoriteChapters.length > 0) {
    lists.push(sublist("Favorites", favoriteChapters));
  }
    lists.push(sublist("All", otherChapters));
    return <List title="Chapters" items={lists} /* close={closeSidebar} */ className="bg-sidebarSecondary dark:bg-dmsidebarSecondary" />;
  
  

/* 
  const newChapterButton = (
    <Button className="mb-xs" rounded={true} onClick={newChapter}>
      New Chapter...
    </Button>
  );
  const items = _items; //[newChapterButton, ..._items]; */

}
