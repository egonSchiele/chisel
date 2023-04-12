import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import * as fd from "./fetchData";
import * as t from "./Types";
import React from "react";
import List from "./components/List";
import { Link, useNavigate } from "react-router-dom";
import Button from "./components/Button";
import {
  ArrowsUpDownIcon,
  EllipsisHorizontalIcon,
  PlusIcon,
  ViewColumnsIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import ListMenu from "./ListMenu";
import { ListItem } from "./ListItem";
//import Draggable from "react-draggable";

export default function ChapterList({
  chapters,
  bookid,
  selectedChapterId,
  onChange,
  closeSidebar,
  dispatch,
  canCloseSidebar = true,
}: {
  chapters: t.Chapter[];
  bookid: string;
  selectedChapterId: string;
  onChange: () => void;
  closeSidebar: () => void;
  dispatch: React.Dispatch<t.ReducerAction>;
  canCloseSidebar?: boolean;
}) {
  const [editing, setEditing] = React.useState(false);
  async function deleteChapter(chapterid: string) {
    console.log("delete chapter", chapterid);
    dispatch({ type: "LOADING" });
    const res = await fetch(`/api/deleteChapter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bookid, chapterid }),
    });
    dispatch({ type: "LOADED" });
    if (!res.ok) {
      console.log(res.statusText);
      return;
    }
    onChange();
  }

  async function favoriteChapter(chapterid: string) {
    console.log("favorite chapter", chapterid);
    dispatch({ type: "LOADING" });
    const res = await fetch(`/api/favoriteChapter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bookid, chapterid }),
    });
    dispatch({ type: "LOADED" });
    if (!res.ok) {
      console.log(res.statusText);
      return;
    }
    onChange();
  }

  const newChapter = async (title = "New Chapter", text = "") => {
    dispatch({ type: "LOADING" });
    const result = await fd.newChapter(bookid, title, text);
    dispatch({ type: "LOADED" });
    if (result.tag === "error") {
      dispatch({ type: "SET_ERROR", payload: result.message });
      return;
    }
    onChange();
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

  const onDragEnd = (result) => {
    if (!result.destination) return;
    console.log(result);
    const ids = chapters.map((chapter) => chapter.chapterid);

    const [removed] = ids.splice(result.source.index, 1);
    ids.splice(result.destination.index, 0, removed);

    dispatch({ type: "SET_CHAPTER_ORDER", payload: { bookid, ids } });
  };

  const sublist = () => {
    return chapters.map((chapter, index) => {
      return (
        <li
          key={chapter.chapterid}
          className={
            !chapter.title ? "italic dark:text-gray-400 text-gray-600" : ""
          }
        >
          <ListItem
            link={`/book/${chapter.bookid}/chapter/${chapter.chapterid}`}
            title={chapter.title || "(no title)"}
            selected={chapter.chapterid === selectedChapterId}
            onDelete={() => deleteChapter(chapter.chapterid)}
            onFavorite={() => favoriteChapter(chapter.chapterid)}
          />
        </li>
      );
    });
  };

  const sublistDraggable = () => {
    return [
      <div>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {chapters.map((chapter, index) => (
                  <Draggable
                    key={chapter.chapterid}
                    draggableId={chapter.chapterid}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="bg-gray-600 p-xs my-1 text-sm border-y-2 border-dmsidebar rounded"
                      >
                        {chapter.title}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>,
    ];
  };

  const navigate = useNavigate();

  /*   const favoriteChapters = chapters.filter((chapter) => chapter.favorite);
  const otherChapters = chapters.filter((chapter) => !chapter.favorite);

  const lists = [];

  if (favoriteChapters.length > 0) {
    if (editing) {
      lists.push(sublistDraggable("Favorites", favoriteChapters));
    } else {
      lists.push(sublist("Favorites", favoriteChapters));
    }
  }
  if (editing) {
    lists.push(sublistDraggable("All", otherChapters));
  } else {
    lists.push(sublist("All", otherChapters));
  } */

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
    onClick: () => newChapter("Untitled"),
    className: buttonStyles,
  };

  const dropdownMenuItems = [
    {
      label: "Grid mode",
      icon: <ViewColumnsIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
      onClick: () => navigate(`/grid/${bookid}`),
      className: buttonStyles,
    },
    {
      label: "Import",
      icon: <PlusIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
      onClick: () => {},
      className: buttonStyles,
    },
    {
      label: "Reorder",
      icon: <ArrowsUpDownIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
      onClick: () => setEditing(true),
      className: buttonStyles,
    },
  ];

  const dropdownMenu = {
    label: "Menu",
    icon: <ListMenu items={dropdownMenuItems} />,
    onClick: () => {},
    className: buttonStyles,
  };

  let leftMenuItem = [newMenuItem, dropdownMenu];
  if (editing) {
    leftMenuItem = [
      {
        label: "Done",
        icon: <p>Done</p>,
        onClick: () => setEditing(false),
        className: buttonStyles,
      },
    ];
  }
  return (
    <List
      title={editing ? "Editing" : "Chapters"}
      items={editing ? sublistDraggable() : sublist()}
      rightMenuItem={rightMenuItem}
      leftMenuItem={leftMenuItem}
      className="bg-sidebarSecondary dark:bg-dmsidebarSecondary"
      onDrop={dropHandler}
    />
  );
}
