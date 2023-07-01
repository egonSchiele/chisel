import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import React, { useContext } from "react";
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
import { getChapterText, getCsrfToken, useLocalStorage } from "./utils";
import { getSelectedBookChapters, librarySlice } from "./reducers/librarySlice";
import Input from "./components/Input";
import { RootState } from "./store";
import sortBy from "lodash/sortBy";
import { nanoid } from "nanoid";
import LibraryContext from "./LibraryContext";
import { useColors } from "./lib/hooks";
import Select from "./components/Select";

// import Draggable from "react-draggable";

type SortType = "alphabetical" | "manual";

export default function ChapterList({
  selectedChapterId,
  mobile = false,
}: {
  selectedChapterId: string;
  mobile?: boolean;
}) {
  const dispatch = useDispatch();

  const chapters = useSelector(getSelectedBookChapters) || [];

  const bookOptions = useSelector((state: RootState) =>
    sortBy(state.library.books, ["title"]).map((book) => ({
      label: book.title,
      value: book.bookid,
    }))
  );
  const bookid = useSelector(
    (state: RootState) => state.library.selectedBookId
  );
  const loaded = useSelector((state: RootState) => state.library.booksLoaded);
  const [editing, setEditing] = React.useState(false);
  const [sortType, setSortType] = useLocalStorage<SortType>(
    "chapterListSort",
    "manual"
  );

  const [searchTerm, setSearchTerm] = React.useState("");
  const navigate = useNavigate();
  const { deleteChapter, saveChapter, newChapter, settings } = useContext(
    LibraryContext
  ) as t.LibraryContextType;

  const uploadFileRef = React.useRef<HTMLInputElement>(null);
  const uploadAudioRef = React.useRef<HTMLInputElement>(null);
  const colors = useColors();

  let sortedChapters = chapters;
  if (sortType === "alphabetical") {
    sortedChapters = sortBy(chapters, ["title"]);
  }

  if (!loaded) {
    return (
      <div
        className={`p-xs h-screen no-scrollbar dark:[color-scheme:dark] overflow-y-auto overflow-x-hidden w-full bg-gray-500 animate-pulse`}
      ></div>
    );
  }

  function _deleteChapter(chapterid: string) {
    dispatch(librarySlice.actions.loading());
    fd.deleteChapter(bookid, chapterid).then((res) => {
      dispatch(librarySlice.actions.loaded());
      if (res.tag === "error") {
        dispatch(librarySlice.actions.setError(res.message));
      }
    });
    deleteChapter(chapterid);
  }

  function handleUpload(x) {
    const files = x.target.files;
    [...files].forEach(async (file, i) => {
      const text = await file.text();
      await newChapter(file.name, text);
    });
  }
  function handleAudioUpload(x) {
    const files = x.target.files;
    [...files].forEach(async (file, i) => {
      const response = await fd.uploadAudio(file);
      console.log(response);
      if (response.tag === "success") {
        const { text } = response.payload;
        await newChapter(file.name, text);
      } else {
        console.log(response);
        dispatch(librarySlice.actions.setError(response.message));
      }
    });
  }

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const ids = sortedChapters.map((chapter) => chapter.chapterid);

    const [removed] = ids.splice(result.source.index, 1);
    ids.splice(result.destination.index, 0, removed);

    dispatch(librarySlice.actions.setChapterOrder(ids));
    setSortType("manual");
  };

  const sublist = () => {
    if (searchTerm === "" || searchTerm.match(/^\s*$/)) {
      return sublistAll();
    } else {
      return sublistSearch();
    }
  };

  const sublistSearch = () => {
    const texts: {
      chapter: t.Chapter;
      text: t.TextBlock;
      preview: string;
      textindex: number;
    }[] = [];
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

    return texts.map(
      ({
        chapter,
        text,
        preview,
        textindex,
      }: {
        chapter: t.Chapter;
        text: t.TextBlock;
        preview: string;
        textindex: number;
      }) => {
        let title = chapter.title || "(no title)";
        title = `[${textindex}] ${title}`;
        if (chapter.status && chapter.status === "done") {
          title = `✅ ${title}`;
        } else if (chapter.status && chapter.status === "in-progress") {
          title = `🚧 ${title}`;
        }

        return (
          <li
            key={text.id || chapter.chapterid}
            className={
              !chapter.title ? "italic dark:text-gray-400 text-gray-600" : ""
            }
          >
            <ListItem
              link={`/book/${chapter.bookid}/chapter/${chapter.chapterid}/${textindex}`}
              title={title}
              content={preview}
              selected={false}
              selector="searchlist"
            />
          </li>
        );
      }
    );
  };

  const sublistAll = () => {
    return sortedChapters.map((chapter, index) => {
      let title = chapter.title || "(no title)";
      if (chapter.status && chapter.status === "done") {
        title = `✅ ${title}`;
      } else if (chapter.status && chapter.status === "in-progress") {
        title = `🚧 ${title}`;
      }
      const previewLength = mobile ? 100 : 50;

      const menuItems: t.MenuItem[] = [
        {
          label: "Delete",
          onClick: () => _deleteChapter(chapter.chapterid),
        },
        {
          label: "Rename",
          onClick: () => startRenameChapter(chapter),
        },
        {
          label: "Move",
          onClick: () => startMoveChapter(chapter),
        },
        {
          label: "Export",
          onClick: () => {
            let title = chapter.title || "untitled";
            title = title.replace(/[^a-z0-9_]/gi, "-").toLowerCase();
            window.location.pathname = `/api/exportChapter/${chapter.bookid}/${chapter.chapterid}/${title}.md`;
          },
        },
        {
          label: "Duplicate",
          onClick: () => {
            duplicateChapter(chapter);
          },
        },
      ];

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
            selector="chapterlist"
            menuItems={menuItems}
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
              {sortedChapters.map((chapter, index) => (
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

  const buttonStyles = "";
  //"hover:bg-sidebar bg-sidebarSecondary dark:bg-dmsidebarSecondary dark:hover:bg-dmsidebar";
  /* let rightMenuItem = canCloseSidebar && {
    label: "Close",
    icon: <XMarkIcon className="w-6 h-6 xl:w-5 xl:h-5" />,
    onClick: closeSidebar,
    className: buttonStyles,
    animate: true,
  }; */

  const newMenuItem = {
    label: "New Chapter",
    icon: <PlusIcon className="w-5 h-5" />,
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
        if (uploadFileRef.current) uploadFileRef.current.click();
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

  if (settings.admin) {
    dropdownMenuItems.push({
      label: "Import Audio",
      icon: <PlusIcon className="w-6 h-6 xl:w-5 xl:h-5" />,
      onClick: () => {
        if (uploadAudioRef.current) uploadAudioRef.current.click();
      },
      className: buttonStyles,
    });
  }

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

  let rightMenuItem: any = bookid && newMenuItem; //, dropdownMenu];

  if (mobile) {
    rightMenuItem = {
      label: "Back",
      icon: <p>Back</p>,
      onClick: () => navigate("/"),
      className: buttonStyles,
      animate: true,
    };
  }

  if (editing) {
    rightMenuItem = {
      label: "Done",
      icon: <p>Done</p>,
      onClick: () => setEditing(false),
      className: buttonStyles,
    };
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

  const selectSort = (
    <Select
      key="sort"
      name="sort"
      value={sortType}
      onChange={(e) => setSortType(e.target.value)}
    >
      <option value="manual">Manual</option>
      <option value="alphabetical">Alphabetical</option>
    </Select>
  );

  const upload = (
    <input
      type="file"
      id="imgupload"
      className="hidden"
      key="upload"
      ref={uploadFileRef}
      multiple={true}
      onChange={handleUpload}
    />
  );
  const uploadAudio = (
    <input
      type="file"
      id="audioupload"
      className="hidden"
      key="audioupload"
      ref={uploadAudioRef}
      multiple={true}
      onChange={handleAudioUpload}
    />
  );
  let chapterCountTitle = `${chapters.length} chapters`;
  if (chapters.length === 1) {
    chapterCountTitle = "1 chapter";
  } else if (chapters.length === 0) {
    chapterCountTitle = "No chapters";
  }
  const finalItems = editing
    ? sublistDraggable()
    : [selectSort, upload, uploadAudio, ...sublist()];
  return (
    <>
      <List
        title={editing ? "Editing" : chapterCountTitle}
        items={finalItems}
        rightMenuItem={rightMenuItem}
        leftMenuItem={leftMenuItem}
        className={`${colors.background} border-r ${colors.borderColor}`}
        selector="chapterlist"
        /*         swipeToClose="left"
        close={closeSidebar}
 */
      />
    </>
  );
}
