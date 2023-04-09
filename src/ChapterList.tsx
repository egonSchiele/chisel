import * as t from "./Types";
import React from "react";
import List from "./components/List";
import { Link } from "react-router-dom";
import Button from "./components/Button";
import {
  EllipsisHorizontalIcon,
  PlusIcon,
  ViewColumnsIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import ListMenu from "./ListMenu";
import { ListItem } from "./ListItem";

export default function ChapterList({
  chapters,
  bookid,
  selectedChapterId,
  onChange,
  closeSidebar,
  canCloseSidebar = true,
}: {
  chapters: t.Chapter[];
  bookid: string;
  selectedChapterId: string;
  onChange: () => void;
  closeSidebar: () => void;
  canCloseSidebar?: boolean;
}) {
  async function deleteChapter(chapterid: string) {
    console.log("delete chapter", chapterid);
    const res = await fetch(`/api/deleteChapter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bookid, chapterid }),
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
      body: JSON.stringify({ bookid, chapterid }),
    });
    if (!res.ok) {
      console.log(res.statusText);
      return;
    }
    onChange();
  }

  const newChapter = async (title = "New Chapter", text = "") => {
    const res = await fetch("/api/newChapter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bookid, title, text }),
    });
    if (!res.ok) {
      console.log("error");
      return;
    }
    await onChange();
  };

  const dropHandler = (ev) => {
    ev.preventDefault();
    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      [...ev.dataTransfer.items].forEach(async (item, i) => {
        // If dropped items aren't files, reject them
        if (item.kind === "file") {
          const file = item.getAsFile();
          const text = await file.text();
          await newChapter(file.name, text);
        }
      });
    } else {
      // Use DataTransfer interface to access the file(s)
      [...ev.dataTransfer.files].forEach(async (file, i) => {
        const text = await file.text();
        await newChapter(file.name, text);
      });
    }
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
    return (
      <List
        key={title}
        title={title}
        items={items}
        level={2}
        className="p-0 m-0 border-0 text-lg pt-0 pl-0 pr-0 border-r-0 mb-sm"
      />
    );
  };

  const favoriteChapters = chapters.filter((chapter) => chapter.favorite);
  const otherChapters = chapters.filter((chapter) => !chapter.favorite);

  const lists = [];

  if (favoriteChapters.length > 0) {
    lists.push(sublist("Favorites", favoriteChapters));
  }
  lists.push(sublist("All", otherChapters));

  const buttonStyles =
    "hover:bg-sidebar bg-sidebarSecondary dark:bg-dmsidebarSecondary dark:hover:bg-dmsidebar";
  const rightMenuItem = canCloseSidebar && {
    label: "Close",
    icon: <XMarkIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
    onClick: closeSidebar,
    className: buttonStyles,
  };

  const newMenuItem = {
    label: "New",
    icon: <PlusIcon className="w-4 h-4 xl:w-5 xl:h-5 mr-xs" />,
    onClick: newChapter,
    className: buttonStyles,
  };

  const showGrid = {
    label: "Grid",
    icon: (
      <Link to={`/grid/${bookid}`}>
        <ViewColumnsIcon className="w-4 h-4 xl:w-5 xl:h-5" />
      </Link>
    ),
    onClick: () => {},
    className: buttonStyles,
  };

  const leftMenuItem = [newMenuItem, showGrid];
  return (
    <List
      title="Chapters"
      items={lists}
      rightMenuItem={rightMenuItem}
      leftMenuItem={leftMenuItem}
      className="bg-sidebarSecondary dark:bg-dmsidebarSecondary"
      onDrop={dropHandler}
    />
  );
}
