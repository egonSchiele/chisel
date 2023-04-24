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
  EyeIcon
} from "@heroicons/react/24/outline";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "./store";
import { fetchSuggestionsWrapper } from "./utils";

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
  currentTextLength
) {
  const launchItems = [
    /*   {
      label: "Save",
      onClick: () => {
        onTextEditorSave(state);
      },
      icon: <DocumentArrowDownIcon className="h-4 w-4" aria-hidden="true" />,
    }, */
    {
      label: "New Chapter",
      onClick: async () => {
        dispatch(librarySlice.actions.loading());
        const result = await fd.newChapter(bookid, "New Chapter", "");
        dispatch(librarySlice.actions.loaded());
        if (result.tag === "error") {
          dispatch(librarySlice.actions.setError(result.message));
        } else {
          dispatch(librarySlice.actions.addChapter(result.payload));
        }
      },
      icon: <PlusIcon className="h-4 w-4" aria-hidden="true" />
    },
    {
      label: "Grid",
      icon: <ViewColumnsIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
      onClick: () => {
        navigate(`/grid/${bookid}`);
      }
    },
    {
      label: panels.bookList.open ? "Close Book List" : "Open Book List",
      icon: <ViewColumnsIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
      onClick: () => {
        dispatch(librarySlice.actions.toggleBookList());
      }
    },
    {
      label: panels.chapterList.open
        ? "Close Chapter List"
        : "Open Chapter List",
      icon: <ViewColumnsIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
      onClick: () => {
        dispatch(librarySlice.actions.toggleChapterList());
      }
    },
    {
      label: panels.prompts.open ? "Close Prompts" : "Open Prompts",
      icon: <ViewColumnsIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
      onClick: () => {
        dispatch(librarySlice.actions.togglePrompts());
      }
    },
    {
      label:
        panels.sidebar.open && panels.sidebar.activePanel === "history"
          ? "Close History"
          : "Open History",
      icon: <ClockIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
      onClick: () => {
        togglePanel("history");
      }
    },
    {
      label:
        panels.sidebar.open && panels.sidebar.activePanel === "info"
          ? "Close Info"
          : "Open Info",
      icon: <InformationCircleIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
      onClick: () => {
        togglePanel("info");
      }
    },
    {
      label:
        panels.sidebar.open && panels.sidebar.activePanel === "suggestions"
          ? "Close Suggestions"
          : "Open Suggestions",
      icon: <ClipboardIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
      onClick: () => {
        togglePanel("suggestions");
      }
    },
    {
      label:
        panels.sidebar.open && panels.sidebar.activePanel === "settings"
          ? "Close Settings"
          : "Open Settings",
      icon: <Cog6ToothIcon className="w-4 h-4 xl:w-5 xl:h-5" />,
      onClick: () => {
        togglePanel("settings");
      }
    }
  ];

  if (books) {
    books.forEach((book, i) => {
      book.chapters.forEach((chapter, i) => {
        launchItems.push({
          label: chapter.title || "(No title)",
          onClick: () => {
            navigate(`/book/${book.bookid}/chapter/${chapter.chapterid}`);
          },
          icon: <Bars3BottomLeftIcon className="h-4 w-4" aria-hidden="true" />
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
      icon: <BookOpenIcon className="h-4 w-4" aria-hidden="true" />
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
          editor,
          dispatch
        );
      },
      icon: <SparklesIcon className="h-4 w-4" aria-hidden="true" />
    });
  }); */

  if (panels.sidebar.open) {
    launchItems.push({
      label: "Close Sidebar",
      onClick: () => {
        dispatch(librarySlice.actions.closeSidebar());
      },
      icon: <ViewColumnsIcon className="h-4 w-4" aria-hidden="true" />
    });
  } else {
    launchItems.push({
      label: "Open Sidebar",
      onClick: () => {
        dispatch(librarySlice.actions.openSidebar());
      },
      icon: <ViewColumnsIcon className="h-4 w-4" aria-hidden="true" />
    });
  }

  if (viewMode === "fullscreen") {
    launchItems.push({
      label: "Exit Fullscreen",
      onClick: () => {
        dispatch(librarySlice.actions.setViewMode("default"));
      },
      icon: <ArrowsPointingInIcon className="h-4 w-4" aria-hidden="true" />
    });
  } else {
    launchItems.push({
      label: "View Sidebar In Fullscreen",
      onClick: () => {
        dispatch(librarySlice.actions.setViewMode("fullscreen"));
      },
      icon: <ArrowsPointingOutIcon className="h-4 w-4" aria-hidden="true" />
    });
  }

  launchItems.push({
    label: "New Block Before Current",
    onClick: () => {
      dispatch(librarySlice.actions.newBlockBeforeCurrent());
    },
    icon: <Bars3Icon className="h-4 w-4" aria-hidden="true" />
  });

  launchItems.push({
    label: "New Block After Current",
    onClick: () => {
      dispatch(librarySlice.actions.newBlockAfterCurrent());
    },
    icon: <Bars3Icon className="h-4 w-4" aria-hidden="true" />
  });

  if (_cachedSelectedText && _cachedSelectedText.length > 0) {
    launchItems.push({
      label: "Extract Block",
      onClick: () => {
        dispatch(librarySlice.actions.extractBlock());
      },
      icon: <Bars3Icon className="h-4 w-4" aria-hidden="true" />
    });
  }
  if (activeTextIndex !== 0) {
    launchItems.push({
      label: "Merge Block Up",
      onClick: () => {
        dispatch(librarySlice.actions.mergeBlockUp());
      },
      icon: <BarsArrowUpIcon className="h-4 w-4" aria-hidden="true" />
    });
  }
  if (activeTextIndex !== currentTextLength - 1) {
    launchItems.push({
      label: "Merge Block Down",
      onClick: () => {
        dispatch(librarySlice.actions.mergeBlockDown());
      },
      icon: <BarsArrowDownIcon className="h-4 w-4" aria-hidden="true" />
    });
  }

  if (viewMode === "focus") {
  } else {
    launchItems.push({
      label: "Focus Mode",
      onClick: () => {
        dispatch(librarySlice.actions.setViewMode("focus"));
      },
      icon: <EyeIcon className="h-4 w-4" aria-hidden="true" />
    });
  }
  return launchItems;
}
