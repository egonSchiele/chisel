import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowsUpDownIcon,
  EllipsisHorizontalIcon,
  PlusIcon,
  ViewColumnsIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from "react-redux";
import * as fd from "./fetchData";
import * as t from "./Types";
import List from "./components/List";
import Button from "./components/Button";
import ListMenu from "./ListMenu";
import ListItem from "./ListItem";
import Popup from "./Popup";
import { getCsrfToken } from "./utils";
import { getSelectedBookChapters, librarySlice } from "./reducers/librarySlice";
// import Draggable from "react-draggable";

export default function ChapterList({
  bookid,
  selectedChapterId,

  onDelete,
  saveChapter,
  closeSidebar,
  canCloseSidebar = true
}: {
  bookid: string;
  selectedChapterId: string;
  onDelete: any;
  saveChapter: any;
  closeSidebar: () => void;
  canCloseSidebar?: boolean;
}) {
  const dispatch = useDispatch();
  const chapters = useSelector(getSelectedBookChapters);
  const [editing, setEditing] = React.useState(false);
  const [showPopup, setShowPopup] = React.useState(false);
  const [currentChapter, setCurrentChapter] = React.useState(chapters[0]);

  async function deleteChapter(chapterid: string) {
    dispatch(librarySlice.actions.loading);
    const res = await fetch(`/api/deleteChapter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ bookid, chapterid, csrfToken: getCsrfToken() })
    });
    dispatch(librarySlice.actions.loaded);
    if (!res.ok) {
      console.log(res.statusText);
      return;
    }
    onDelete(chapterid);
  }

  const newChapter = async (title = "New Chapter", text = "") => {
    dispatch(librarySlice.actions.loading());
    const result = await fd.newChapter(bookid, title, text);
    dispatch(librarySlice.actions.loaded());
    if (result.tag === "error") {
      dispatch(librarySlice.actions.setError(result.message));
      return;
    }
    const chapter = result.payload;
    dispatch(librarySlice.actions.addChapter(chapter));
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
    const ids = chapters.map((chapter) => chapter.chapterid);

    const [removed] = ids.splice(result.source.index, 1);
    ids.splice(result.destination.index, 0, removed);

    dispatch(librarySlice.actions.setChapterOrder(ids));
  };

  const sublist = () =>
    chapters.map((chapter, index) => (
      <li
        key={chapter.chapterid}
        className={
          !chapter.title ? "italic dark:text-gray-400 text-gray-600" : ""
        }
      >
        <ListItem
          link={`/book/${chapter.bookid}/chapter/${chapter.chapterid}`}
          title={chapter.title || "(no title)"}
          content={
            chapter.text
              .map((t) => t.text)
              .join(". ")
              .substring(0, 50) + "..."
          }
          selected={chapter.chapterid === selectedChapterId}
          onDelete={() => deleteChapter(chapter.chapterid)}
          onFavorite={() => {}}
          onRename={() => startRenameChapter(chapter)}
          selector="chapterlist"
        />
      </li>
    ));

  async function renameChapter(chapter, newTitle) {
    const newChapter = { ...chapter, title: newTitle };
    saveChapter(newChapter);
    setShowPopup(false);
  }

  function startRenameChapter(chapter) {
    setCurrentChapter(chapter);
    setShowPopup(true);
  }

  const sublistDraggable = () => [
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
    </div>
  ];

  const navigate = useNavigate();

  const buttonStyles =
    "hover:bg-sidebar bg-sidebarSecondary dark:bg-dmsidebarSecondary dark:hover:bg-dmsidebar";
  const rightMenuItem = canCloseSidebar && {
    label: "Close",
    icon: <XMarkIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
    onClick: closeSidebar,
    className: buttonStyles
  };

  const newMenuItem = {
    label: "New",
    icon: <PlusIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
    onClick: () => newChapter("New chapter"),
    className: buttonStyles
  };

  const dropdownMenuItems = [
    {
      label: "Grid mode",
      icon: <ViewColumnsIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
      onClick: () => navigate(`/grid/${bookid}`),
      className: buttonStyles
    },
    /*  {
      label: "Import",
      icon: <PlusIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
      onClick: () => {},
      className: buttonStyles,
    }, */
    {
      label: "Reorder",
      icon: <ArrowsUpDownIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
      onClick: () => setEditing(true),
      className: buttonStyles
    }
  ];

  const dropdownMenu = {
    label: "Menu",
    icon: (
      <ListMenu
        items={dropdownMenuItems}
        label="Chapter Menu"
        selector="chapter-menu"
      />
    ),
    onClick: () => {},
    className: buttonStyles
  };

  let leftMenuItem = [newMenuItem, dropdownMenu];

  leftMenuItem = leftMenuItem.map((item, idx) => {
    let { className } = item;
    if (idx !== leftMenuItem.length - 1) {
      className = `${className} mr-xs`;
    }

    return { ...item, className };
  });

  if (editing) {
    leftMenuItem = [
      {
        label: "Done",
        icon: <p>Done</p>,
        onClick: () => setEditing(false),
        className: buttonStyles
      }
    ];
  }
  return (
    <>
      {showPopup && (
        <Popup
          title="Rename Chapter"
          inputValue={currentChapter.title}
          onClose={() => setShowPopup(false)}
          onChange={(newTitle) => renameChapter(currentChapter, newTitle)}
        />
      )}
      <List
        title={editing ? "Editing" : "Chapters"}
        items={editing ? sublistDraggable() : sublist()}
        rightMenuItem={rightMenuItem}
        leftMenuItem={leftMenuItem}
        className="bg-sidebarSecondary dark:bg-dmsidebarSecondary"
        onDrop={dropHandler}
        selector="chapterlist"
      />
    </>
  );
}
