import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowsUpDownIcon,
  EllipsisHorizontalIcon,
  MagnifyingGlassCircleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ViewColumnsIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from "react-redux";
import * as fd from "./lib/fetchData";
import * as t from "./Types";
import List from "./components/List";
import Button from "./components/Button";
import ListMenu from "./components/ListMenu";
import ListItem from "./components/ListItem";
import Popup from "./components/Popup";
import { getChapterText, getCsrfToken } from "./utils";
import { getSelectedBookChapters, librarySlice } from "./reducers/librarySlice";
import Input from "./components/Input";
import { RootState } from "./store";
import sortBy from "lodash/sortBy";
import { nanoid } from "nanoid";

// import Draggable from "react-draggable";

export default function ChapterList({
  bookid,
  selectedChapterId,
  onDelete,
  saveChapter,
  closeSidebar,
  newChapter,
  mobile = false,
  canCloseSidebar = true,
}: {
  bookid: string;
  selectedChapterId: string;
  onDelete: any;
  saveChapter: (chapter: t.Chapter) => Promise<void>;
  closeSidebar: () => void;
  newChapter: (title?: string, text?: string) => void;
  mobile?: boolean;
  canCloseSidebar?: boolean;
}) {
  const dispatch = useDispatch();
  const [mode, setMode] = React.useState("chapters");
  const chapters = useSelector(getSelectedBookChapters) || [];
  const bookOptions = useSelector((state: RootState) =>
    sortBy(state.library.books, ["title"]).map((book) => ({
      label: book.title,
      value: book.bookid,
    }))
  );
  const [editing, setEditing] = React.useState(false);

  const [searchTerm, setSearchTerm] = React.useState("");
  const navigate = useNavigate();
  const uploadFileRef = React.useRef<HTMLInputElement>(null);
  async function deleteChapter(chapterid: string) {
    dispatch(librarySlice.actions.loading);
    const res = await fetch(`/api/deleteChapter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bookid, chapterid, csrfToken: getCsrfToken() }),
    });
    dispatch(librarySlice.actions.loaded);
    if (!res.ok) {
      console.log(res.statusText);
      return;
    }
    onDelete(chapterid);
  }

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

  function handleUpload(x) {
    const files = x.target.files;
    [...files].forEach(async (file, i) => {
      const text = await file.text();
      await newChapter(file.name, text);
    });
  }

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const ids = chapters.map((chapter) => chapter.chapterid);

    const [removed] = ids.splice(result.source.index, 1);
    ids.splice(result.destination.index, 0, removed);

    dispatch(librarySlice.actions.setChapterOrder(ids));
  };

  const sublist = () => {
    if (searchTerm === "" || searchTerm.match(/^\s*$/)) {
      return sublistAll();
    } else {
      return sublistSearch();
    }
  };

  const sublistSearch = () => {
    const texts = [];
    const term = searchTerm.toLowerCase();
    const previewLength = mobile ? 100 : 50;
    chapters.forEach((chapter, i) => {
      chapter.text.forEach((text, textindex) => {
        const textText = text.text.toLowerCase();
        const index = textText.indexOf(term);
        if (index !== -1) {
          const start = Math.max(0, index - previewLength / 2);
          const end = Math.min(textText.length, index + previewLength / 2);
          const preview = `...${textText.substring(
            start,
            index
          )}*${textText.substring(
            index,
            index + term.length
          )}*${textText.substring(index + term.length, end)}...`;
          texts.push({ chapter, text, preview, textindex });
        }
      });
    });

    return texts.map(({ chapter, text, preview, textindex }) => {
      let title = chapter.title || "(no title)";
      title = `[${textindex}] ${title}`;
      if (chapter.status && chapter.status === "done") {
        title = `✅ ${title}`;
      } else if (chapter.status && chapter.status === "in-progress") {
        title = `🚧 ${title}`;
      }

      return (
        <li
          key={text.id}
          className={
            !chapter.title ? "italic dark:text-gray-400 text-gray-600" : ""
          }
        >
          <ListItem
            link={`/book/${chapter.bookid}/chapter/${chapter.chapterid}/${textindex}`}
            title={title}
            content={preview}
            selected={false}
            onDelete={null}
            onFavorite={null}
            onRename={null}
            onMove={null}
            onExport={null}
            selector="searchlist"
          />
        </li>
      );
    });
  };

  const sublistAll = () => {
    return chapters.map((chapter, index) => {
      let title = chapter.title || "(no title)";
      if (chapter.status && chapter.status === "done") {
        title = `✅ ${title}`;
      } else if (chapter.status && chapter.status === "in-progress") {
        title = `🚧 ${title}`;
      }
      const previewLength = mobile ? 100 : 50;
      return (
        <li
          key={chapter.chapterid}
          className={
            !chapter.title ? "italic dark:text-gray-400 text-gray-600" : ""
          }
        >
          <ListItem
            link={`/book/${chapter.bookid}/chapter/${chapter.chapterid}`}
            title={title}
            content={`${chapter.text
              .map((t) => t.text)
              .join(". ")
              .substring(0, previewLength)}...`}
            selected={chapter.chapterid === selectedChapterId}
            onDelete={() => deleteChapter(chapter.chapterid)}
            onFavorite={() => {}}
            onRename={() => startRenameChapter(chapter)}
            onMove={() => startMoveChapter(chapter)}
            onExport={() => {
              let title = chapter.title || "untitled";
              title = title.replace(/[^a-z0-9_]/gi, "-").toLowerCase();
              window.location.pathname = `/api/exportChapter/${chapter.bookid}/${chapter.chapterid}/${title}.md`;
            }}
            onDuplicate={() => {
              duplicateChapter(chapter);
            }}
            selector="chapterlist"
          />
        </li>
      );
    });
  };

  async function duplicateChapter(chapter) {
    const newChapter = { ...chapter, chapterid: nanoid() };
    newChapter.title = `${newChapter.title} (copy)`;
    await saveChapter(newChapter);
    dispatch(
      librarySlice.actions.addChapter({
        chapter: newChapter,
        bookid: chapter.bookid,
      })
    );
  }

  async function renameChapter(chapter, newTitle) {
    const newChapter = { ...chapter, title: newTitle };
    await saveChapter(newChapter);
  }

  async function moveChapter(chapter, bookid) {
    const newChapter = { ...chapter, bookid };
    await saveChapter(newChapter);
  }

  function startRenameChapter(chapter) {
    dispatch(
      librarySlice.actions.showPopup({
        title: "Rename Chapter",
        inputValue: chapter.title,
        onSubmit: (newTitle) => renameChapter(chapter, newTitle),
      })
    );
  }

  function startMoveChapter(chapter) {
    dispatch(
      librarySlice.actions.showPopup({
        title: "Move Chapter",
        inputValue: chapter.bookid,
        options: bookOptions,
        onSubmit: (newBookId) => moveChapter(chapter, newBookId),
      })
    );
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
    </div>,
  ];

  const buttonStyles =
    "hover:bg-sidebar bg-sidebarSecondary dark:bg-dmsidebarSecondary dark:hover:bg-dmsidebar";
  /* let rightMenuItem = canCloseSidebar && {
    label: "Close",
    icon: <XMarkIcon className="w-6 h-6 xl:w-5 xl:h-5" />,
    onClick: closeSidebar,
    className: buttonStyles,
    animate: true,
  }; */

  /*  rightMenuItem = mobile && {
    label: "Back",
    icon: <p>Back</p>,
    onClick: () => navigate("/"),
    className: buttonStyles,
    animate: true,
  }; */

  const newMenuItem = {
    label: "New",
    icon: <PlusIcon className="w-6 h-6 xl:w-5 xl:h-5" />,
    onClick: () => newChapter("New chapter"),
    className: buttonStyles,
    showSpinner: true,
    animate: true,
  };

  const dropdownMenuItems = [
    /*     {
      label: "Grid mode",
      icon: <ViewColumnsIcon className="w-6 h-6 xl:w-5 xl:h-5" />,
      onClick: () => navigate(`/grid/${bookid}`),
      className: buttonStyles,
    },
 */ {
      label: "Import",
      icon: <PlusIcon className="w-6 h-6 xl:w-5 xl:h-5" />,
      onClick: () => {
        uploadFileRef.current.click();
      },
      className: buttonStyles,
    },
    {
      label: "Reorder",
      icon: <ArrowsUpDownIcon className="w-6 h-6 xl:w-5 xl:h-5" />,
      onClick: () => setEditing(true),
      className: buttonStyles,
    },
  ];

  const leftMenuItem = {
    label: "Menu",
    icon: (
      <ListMenu
        items={dropdownMenuItems}
        label="Chapter Menu"
        selector="chapter-menu"
        className="-translate-x-1/4"
      />
    ),
    onClick: () => {},
    className: buttonStyles,
  };

  let rightMenuItem: any = newMenuItem; //, dropdownMenu];

  if (editing) {
    rightMenuItem = [
      {
        label: "Done",
        icon: <p>Done</p>,
        onClick: () => setEditing(false),
        className: buttonStyles,
      },
    ];
  }
  const search = (
    <Input
      key="search"
      name="search"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="relative"
      inputClassName="pl-10"
      icon={
        <MagnifyingGlassIcon
          className="h-6 w-6 text-gray-300 dark:text-gray-600"
          aria-hidden="true"
        />
      }
    />
  );

  const upload = (
    <input
      type="file"
      id="imgupload"
      className="hidden"
      key="upload"
      ref={uploadFileRef}
      onChange={handleUpload}
    />
  );
  let chapterCountTitle = `${chapters.length} chapters`;
  if (chapters.length === 1) {
    chapterCountTitle = "1 chapter";
  } else if (chapters.length === 0) {
    chapterCountTitle = "No chapters";
  }
  if (mode === "chapters") {
    return (
      <>
        <List
          title={editing ? "Editing" : chapterCountTitle}
          items={editing ? sublistDraggable() : [search, upload, ...sublist()]}
          rightMenuItem={rightMenuItem}
          leftMenuItem={leftMenuItem}
          className="bg-sidebarSecondary dark:bg-dmsidebarSecondary border-r border-gray-700"
          onDrop={dropHandler}
          selector="chapterlist"
          onTitleClick={() => setMode("references")}
          /*         swipeToClose="left"
        close={closeSidebar}
 */
        />
      </>
    );
  }

  const referenceBlocks = [];
  chapters.forEach((chapter) => {
    chapter.text.forEach((block, index) => {
      if (block.reference) {
        referenceBlocks.push({ block, index, chapter });
      }
    });
  });

  let referenceCountTitle = `${referenceBlocks.length} references`;
  if (referenceBlocks.length === 1) {
    referenceCountTitle = "1 reference";
  } else if (referenceBlocks.length === 0) {
    referenceCountTitle = "No references";
  }

  const { textindex } = useParams();
  const referenceItems = referenceBlocks.map(({ block, index, chapter }, i) => {
    let title = chapter.title || "(no title)";
    if (chapter.status && chapter.status === "done") {
      title = `✅ ${title}`;
    } else if (chapter.status && chapter.status === "in-progress") {
      title = `🚧 ${title}`;
    }
    const previewLength = 250;
    return (
      <li
        key={i}
        className={
          !chapter.title ? "italic dark:text-gray-400 text-gray-600" : ""
        }
      >
        <ListItem
          link={`/book/${chapter.bookid}/chapter/${chapter.chapterid}/${index}`}
          title={title}
          content={`${block.text.substring(0, previewLength)}...`}
          contentClassName="line-clamp-4"
          selected={
            chapter.chapterid === selectedChapterId && index === textindex
          }
          selector="referencelist"
        />
      </li>
    );
  });

  return (
    <>
      <List
        title={referenceCountTitle}
        items={referenceItems}
        leftMenuItem={null}
        rightMenuItem={rightMenuItem}
        className="bg-sidebarSecondary dark:bg-dmsidebarSecondary border-r border-b border-gray-500"
        selector="referencelist"
        onTitleClick={() => setMode("chapters")}
      />
    </>
  );
}
