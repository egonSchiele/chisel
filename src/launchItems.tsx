import { getSelectedChapter, librarySlice } from "./reducers/librarySlice";
import * as fd from "./fetchData";
import {
  DocumentArrowDownIcon,
  PlusIcon,
  ViewColumnsIcon,
  ClockIcon,
  InformationCircleIcon,
  ClipboardIcon,
  Cog6ToothIcon,
  Bars3BottomLeftIcon,
  BookOpenIcon,
  SparklesIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  Bars3Icon,
  BarsArrowUpIcon,
  BarsArrowDownIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "./store";
import { fetchSuggestionsWrapper } from "./utils";

function Leaf() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      xmlSpace="preserve"
      width="100%"
      height="100%"
    >
      <path
        xmlns="http://www.w3.org/2000/svg"
        d="M21 3v2c0 9.627-5.373 14-12 14H7.098c.212-3.012 1.15-4.835 3.598-7.001 1.204-1.065 1.102-1.68.509-1.327-4.084 2.43-6.112 5.714-6.202 10.958L5 22H3c0-1.363.116-2.6.346-3.732C3.116 16.974 3 15.218 3 13 3 7.477 7.477 3 13 3c2 0 4 1 8 0z"
      ></path>
    </svg>
  );
}

export default function useLaunchItems(
  dispatch,
  bookid,
  togglePanel,
  navigate,
  settings,
  setLoading,
  onSuggestionLoad,
  panels,
  books,
  _cachedSelectedText,
  activeTextIndex,
  viewMode,
  currentTextLength,
  newChapter,
  newBook,
  newCompostNote,
  onEditorSave,
  getTextForSuggestions
) {
  const launchItems = [
    {
      label: "Save",
      onClick: () => {
        onEditorSave();
      },
      tooltip: "Command+s",
      icon: <DocumentArrowDownIcon className="h-4 w-4" aria-hidden="true" />,
    },
    {
      label: "New Chapter",
      onClick: newChapter,
      icon: <PlusIcon className="h-4 w-4" aria-hidden="true" />,
      tooltip: "Alt+n",
    },
    {
      label: "New Book",
      onClick: newBook,
      icon: <PlusIcon className="h-4 w-4" aria-hidden="true" />,
    },
    {
      label: "New Compost Note",
      onClick: newCompostNote,
      icon: <PlusIcon className="h-4 w-4" aria-hidden="true" />,
      tooltip: "Command+Shift+c",
    },
    {
      label: "Grid",
      icon: <ViewColumnsIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
      onClick: () => {
        navigate(`/grid/${bookid}`);
      },
    },
    {
      label: panels.bookList.open ? "Close Book List" : "Open Book List",
      icon: <ViewColumnsIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
      onClick: () => {
        dispatch(librarySlice.actions.toggleBookList());
      },
    },
    {
      label: panels.chapterList.open
        ? "Close Chapter List"
        : "Open Chapter List",
      icon: <ViewColumnsIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
      onClick: () => {
        dispatch(librarySlice.actions.toggleChapterList());
      },
    },
    {
      label: panels.prompts.open ? "Close Prompts" : "Open Prompts",
      icon: <ViewColumnsIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
      onClick: () => {
        dispatch(librarySlice.actions.togglePrompts());
      },
    },
    {
      label:
        panels.sidebar.open && panels.sidebar.activePanel === "history"
          ? "Close History"
          : "Open History",
      icon: <ClockIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
      onClick: () => {
        togglePanel("history");
      },
    },
    {
      label:
        panels.sidebar.open && panels.sidebar.activePanel === "info"
          ? "Close Info"
          : "Open Info",
      icon: <InformationCircleIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
      onClick: () => {
        togglePanel("info");
      },
    },
    {
      label:
        panels.sidebar.open && panels.sidebar.activePanel === "suggestions"
          ? "Close Suggestions"
          : "Open Suggestions",
      icon: <ClipboardIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
      onClick: () => {
        togglePanel("suggestions");
      },
    },
    {
      label:
        panels.sidebar.open && panels.sidebar.activePanel === "settings"
          ? "Close Settings"
          : "Open Settings",
      icon: <Cog6ToothIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
      onClick: () => {
        togglePanel("settings");
      },
    },
  ];

  if (books) {
    books.forEach((book, i) => {
      book.chapters.forEach((chapter, i) => {
        launchItems.push({
          label: chapter.title || "(No title)",
          onClick: () => {
            navigate(`/book/${book.bookid}/chapter/${chapter.chapterid}`);
          },
          icon: <Bars3BottomLeftIcon className="h-4 w-4" aria-hidden="true" />,
        });
      });
    });
  }

  books.forEach((book, i) => {
    launchItems.push({
      label: book.title,
      onClick: () => {
        navigate(`/book/${book.bookid}`);
      },
      icon: <BookOpenIcon className="h-4 w-4" aria-hidden="true" />,
    });
  });

  /*   settings.prompts.forEach((prompt, i) => {
    launchItems.push({
      label: prompt.label,
      onClick: () => {
        fetchSuggestionsWrapper(
          settings,
          setLoading,
          onSuggestionLoad,
          prompt.text,
          prompt.label,
          getTextForSuggestions(),
          dispatch
        );
      },

      icon: <SparklesIcon className="h-4 w-4" aria-hidden="true" />,
    });
  }); */

  if (panels.sidebar.open) {
    launchItems.push({
      label: "Close Sidebar",
      onClick: () => {
        dispatch(librarySlice.actions.closeSidebar());
      },
      icon: <ViewColumnsIcon className="h-4 w-4" aria-hidden="true" />,
    });
  } else {
    launchItems.push({
      label: "Open Sidebar",
      onClick: () => {
        dispatch(librarySlice.actions.openSidebar());
      },
      icon: <ViewColumnsIcon className="h-4 w-4" aria-hidden="true" />,
    });
  }

  if (viewMode === "fullscreen") {
    launchItems.push({
      label: "Exit Fullscreen",
      onClick: () => {
        dispatch(librarySlice.actions.setViewMode("default"));
      },
      icon: <ArrowsPointingInIcon className="h-4 w-4" aria-hidden="true" />,
      tooltip: "Esc",
    });
  } else {
    launchItems.push({
      label: "View Sidebar In Fullscreen",
      onClick: () => {
        dispatch(librarySlice.actions.setViewMode("fullscreen"));
      },
      icon: <ArrowsPointingOutIcon className="h-4 w-4" aria-hidden="true" />,
    });
  }

  launchItems.push({
    label: "New Block Before Current",
    onClick: () => {
      dispatch(librarySlice.actions.newBlockBeforeCurrent());
    },
    icon: <Bars3Icon className="h-4 w-4" aria-hidden="true" />,
  });

  launchItems.push({
    label: "New Block After Current",
    onClick: () => {
      dispatch(librarySlice.actions.newBlockAfterCurrent());
    },
    icon: <Bars3Icon className="h-4 w-4" aria-hidden="true" />,
  });

  if (_cachedSelectedText && _cachedSelectedText.length > 0) {
    launchItems.push({
      label: "Extract Block",
      onClick: () => {
        dispatch(librarySlice.actions.extractBlock());
      },
      icon: <Bars3Icon className="h-4 w-4" aria-hidden="true" />,
      tooltip: "Alt+Shift+Down",
    });
  }
  if (activeTextIndex !== 0) {
    launchItems.push({
      label: "Merge Block Up",
      onClick: () => {
        dispatch(librarySlice.actions.mergeBlockUp());
      },
      icon: <BarsArrowUpIcon className="h-4 w-4" aria-hidden="true" />,
    });
  }
  if (activeTextIndex !== currentTextLength - 1) {
    launchItems.push({
      label: "Merge Block Down",
      onClick: () => {
        dispatch(librarySlice.actions.mergeBlockDown());
      },
      icon: <BarsArrowDownIcon className="h-4 w-4" aria-hidden="true" />,
    });
  }

  if (viewMode !== "readonly") {
    launchItems.push({
      label: "Read Only Mode",
      onClick: () => {
        dispatch(librarySlice.actions.setViewMode("readonly"));
      },
      icon: <PencilIcon className="h-4 w-4" aria-hidden="true" />,
    });
  }

  if (viewMode !== "focus") {
    launchItems.push({
      label: "Focus Mode",
      onClick: () => {
        dispatch(librarySlice.actions.setViewMode("focus"));
      },
      icon: <EyeIcon className="h-4 w-4" aria-hidden="true" />,
    });
  }
  if (viewMode !== "diff" && activeTextIndex !== currentTextLength - 1) {
    launchItems.push({
      label: "Diff with block below",
      onClick: () => {
        dispatch(librarySlice.actions.setViewMode("diff"));
      },
      icon: <DocumentDuplicateIcon className="h-4 w-4" aria-hidden="true" />,
      tooltip: "Command+Shift+d",
    });
  }
  return launchItems;
}
