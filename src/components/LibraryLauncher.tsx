import React, { useContext } from "react";
import {
  getSelectedBook,
  getSelectedChapter,
  librarySlice,
} from "../reducers/librarySlice";
import * as fd from "../lib/fetchData";
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
  WrenchIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { fetchSuggestionsWrapper } from "../utils";
import sortBy from "lodash/sortBy";
import Launcher from "../Launcher";
import {
  LibraryContextType,
  MenuItem,
  State,
  blockTypes,
  chapterStatuses,
} from "../Types";
import { useNavigate } from "react-router-dom";
import { languages } from "../lib/languages";
import LibraryContext from "../LibraryContext";

export default function LibraryLauncher({ onEditorSave, onLauncherClose }) {
  const state: State = useSelector((state: RootState) => state.library);
  const currentBook = useSelector(getSelectedBook);

  const currentChapter = getSelectedChapter({ library: state });
  const currentText = useSelector((state: RootState) => {
    const chapter = getSelectedChapter(state);
    return chapter ? chapter.text : [];
  });

  let currentTextBlock = null;
  if (state.editor.activeTextIndex !== null) {
    currentTextBlock = currentText[state.editor.activeTextIndex];
  }

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { newBook, newCompostNote, newChapter, renameBook, renameChapter } =
    useContext(LibraryContext) as LibraryContextType;

  function toggleRightPanel(panel: string) {
    if (
      state.panels.rightSidebar.open &&
      state.panels.rightSidebar.activePanel === panel
    ) {
      dispatch(librarySlice.actions.closeRightSidebar());
    } else {
      dispatch(librarySlice.actions.openRightSidebar());
      dispatch(librarySlice.actions.setActivePanel(panel));
    }
  }

  function getTextForSuggestions() {
    let { text } = currentText[state.editor.activeTextIndex];
    if (
      state.editor._cachedSelectedText &&
      state.editor._cachedSelectedText.contents &&
      state.editor._cachedSelectedText.contents.length > 0
    ) {
      text = state.editor._cachedSelectedText.contents;
    }
    return text;
  }

  const launchItems: MenuItem[] = [
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
    /*  {
      label: "Grid",
      icon: <ViewColumnsIcon className="w-6 h-6 xl:w-5 xl:h-5" />,
      onClick: () => {
        navigate(`/grid/${bookid}`);
      },
    }, */
    {
      label:
        state.panels.leftSidebar.open &&
        state.panels.leftSidebar.activePanel === "filenavigator"
          ? "Close File Navigator"
          : "Open File Navigator",
      icon: <ViewColumnsIcon className="w-6 h-6 xl:w-5 xl:h-5" />,
      onClick: () => {
        dispatch(librarySlice.actions.toggleFileNavigator());
      },
    },

    {
      label:
        state.panels.leftSidebar.open &&
        state.panels.leftSidebar.activePanel === "prompts"
          ? "Close Prompts"
          : "Open Prompts",
      icon: <ViewColumnsIcon className="w-6 h-6 xl:w-5 xl:h-5" />,
      onClick: () => {
        dispatch(librarySlice.actions.togglePrompts());
      },
      tooltip: "Command+p",
    },

    {
      label:
        state.panels.leftSidebar.open &&
        state.panels.leftSidebar.activePanel === "blocks"
          ? "Close Blocks"
          : "Open Blocks",
      icon: <ViewColumnsIcon className="w-6 h-6 xl:w-5 xl:h-5" />,
      onClick: () => {
        dispatch(librarySlice.actions.toggleBlocks());
      },
      tooltip: "Command+b",
    },
    {
      label:
        state.panels.leftSidebar.open &&
        state.panels.leftSidebar.activePanel === "outline"
          ? "Close Outline"
          : "Open Outline",
      icon: <ViewColumnsIcon className="w-6 h-6 xl:w-5 xl:h-5" />,
      onClick: () => {
        dispatch(librarySlice.actions.toggleOutline());
      },
      tooltip: "Command+Shift+o",
    },

    {
      label:
        state.panels.rightSidebar.open &&
        state.panels.rightSidebar.activePanel === "history"
          ? "Close History"
          : "Open History",
      icon: <ClockIcon className="w-6 h-6 xl:w-5 xl:h-5" />,
      onClick: () => {
        toggleRightPanel("history");
      },
    },
    {
      label:
        state.panels.rightSidebar.open &&
        state.panels.rightSidebar.activePanel === "info"
          ? "Close Info"
          : "Open Info",
      icon: <InformationCircleIcon className="w-6 h-6 xl:w-5 xl:h-5" />,
      onClick: () => {
        toggleRightPanel("info");
      },
    },
    {
      label:
        state.panels.rightSidebar.open &&
        state.panels.rightSidebar.activePanel === "suggestions"
          ? "Close Suggestions"
          : "Open Suggestions",
      icon: <ClipboardIcon className="w-6 h-6 xl:w-5 xl:h-5" />,
      onClick: () => {
        toggleRightPanel("suggestions");
      },
    },
    {
      label:
        state.panels.rightSidebar.open &&
        state.panels.rightSidebar.activePanel === "settings"
          ? "Close Settings"
          : "Open Settings",
      icon: <Cog6ToothIcon className="w-6 h-6 xl:w-5 xl:h-5" />,
      onClick: () => {
        toggleRightPanel("settings");
      },
    },
    /* {
      label: "Show Book List Only",
      icon: <Cog6ToothIcon className="w-6 h-6 xl:w-5 xl:h-5" />,
      onClick: () => {
        dispatch(librarySlice.actions.openOnlyPanel("bookList"));
      },
    },
    {
      label: "Show Chapter List Only",
      icon: <Cog6ToothIcon className="w-6 h-6 xl:w-5 xl:h-5" />,
      onClick: () => {
        dispatch(librarySlice.actions.openOnlyPanel("chapterList"));
      },
    },
    {
      label: "Show Prompts Only",
      icon: <Cog6ToothIcon className="w-6 h-6 xl:w-5 xl:h-5" />,
      onClick: () => {
        dispatch(librarySlice.actions.openOnlyPanel("prompts"));
      },
    },
    {
      label: "Show Sidebar Only",
      icon: <Cog6ToothIcon className="w-6 h-6 xl:w-5 xl:h-5" />,
      onClick: () => {
        dispatch(librarySlice.actions.openOnlyPanel("sidebar"));
      },
    }, */
  ];

  if (state.books) {
    sortBy(state.books, ["title"]).forEach((book, i) => {
      sortBy(book.chapters, ["title"]).forEach((chapter, i) => {
        let label = chapter.title || "(No title)";
        label = `${label} (${book.title})`;
        if (label.length > 30) label = label.slice(0, 30) + "...";
        launchItems.push({
          label,
          onClick: () => {
            navigate(`/book/${book.bookid}/chapter/${chapter.chapterid}`);
          },
          icon: <Bars3BottomLeftIcon className="h-4 w-4" aria-hidden="true" />,
        });
      });
    });
  }

  state.books.forEach((book, i) => {
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

  /*   if (state.panels.sidebar.open) {
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
        dispatch(librarySlice.actions.openRightSidebar());
      },
      icon: <ViewColumnsIcon className="h-4 w-4" aria-hidden="true" />,
    });
  } */

  if (state.viewMode === "fullscreen") {
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

  if (
    state.editor._cachedSelectedText &&
    state.editor._cachedSelectedText.length > 0
  ) {
    launchItems.push({
      label: "Extract Block",
      onClick: () => {
        dispatch(librarySlice.actions.extractBlock());
      },
      icon: <Bars3Icon className="h-4 w-4" aria-hidden="true" />,
      tooltip: "Alt+Shift+Down",
    });
  }
  if (state.editor.activeTextIndex !== 0) {
    launchItems.push({
      label: "Merge Block Up",
      onClick: () => {
        dispatch(librarySlice.actions.mergeBlockUp());
      },
      icon: <BarsArrowUpIcon className="h-4 w-4" aria-hidden="true" />,
    });
  }
  if (state.editor.activeTextIndex !== currentText.length - 1) {
    launchItems.push({
      label: "Merge Block Down",
      onClick: () => {
        dispatch(librarySlice.actions.mergeBlockDown());
      },
      icon: <BarsArrowDownIcon className="h-4 w-4" aria-hidden="true" />,
    });
  }
  if (
    state.editor.activeTextIndex !== 0 &&
    state.editor.activeTextIndex !== currentText.length - 1
  ) {
    launchItems.push({
      label: "Merge With Surrounding Blocks",
      onClick: () => {
        dispatch(librarySlice.actions.mergeBlockSurrounding());
      },
      icon: <ArrowsUpDownIcon className="h-4 w-4" aria-hidden="true" />,
    });
  }

  if (state.viewMode !== "readonly") {
    launchItems.push({
      label: "Read Only Mode",
      onClick: () => {
        dispatch(librarySlice.actions.setViewMode("readonly"));
      },
      icon: <PencilIcon className="h-4 w-4" aria-hidden="true" />,
      tooltip: "Command+Shift+r",
    });
  }

  if (state.viewMode !== "focus") {
    launchItems.push({
      label: "Focus Mode",
      onClick: () => {
        dispatch(librarySlice.actions.setViewMode("focus"));
      },
      icon: <EyeIcon className="h-4 w-4" aria-hidden="true" />,
    });
  }
  if (
    state.viewMode !== "diff" &&
    state.editor.activeTextIndex !== currentText.length - 1
  ) {
    launchItems.push({
      label: "Diff with block below",
      onClick: () => {
        dispatch(librarySlice.actions.setViewMode("diff"));
      },
      icon: <DocumentDuplicateIcon className="h-4 w-4" aria-hidden="true" />,
      tooltip: "Command+Shift+d",
    });
  }

  if (currentText.length && currentText.length > 0) {
    launchItems.push({
      label: "Convert title to title case",
      onClick: () => {
        dispatch(librarySlice.actions.setAPStyleTitle());
      },
      icon: <WrenchIcon className="h-4 w-4" aria-hidden="true" />,
    });
  }

  if (currentChapter) {
    launchItems.push({
      label: "Rename Chapter",
      onClick: () => {
        dispatch(
          librarySlice.actions.showPopup({
            title: "Rename Chapter",
            inputValue: currentChapter.title,
            onSubmit: (newTitle) =>
              renameChapter(currentChapter.chapterid, newTitle),
          })
        );
      },
      icon: <WrenchIcon className="h-4 w-4" aria-hidden="true" />,
    });
  }

  if (currentBook) {
    launchItems.push({
      label: "Rename Book",
      onClick: () => {
        dispatch(
          librarySlice.actions.showPopup({
            title: "Rename Book",
            inputValue: currentBook.title,
            onSubmit: (newTitle) => renameBook(currentBook.bookid, newTitle),
          })
        );
      },
      icon: <WrenchIcon className="h-4 w-4" aria-hidden="true" />,
    });
  }

  if (currentTextBlock) {
    launchItems.push({
      label: "Add New Version",
      onClick: () => {
        dispatch(
          librarySlice.actions.addVersion({
            index: state.editor.activeTextIndex,
          })
        );
      },
      icon: <Bars3BottomLeftIcon className="h-4 w-4" aria-hidden="true" />,
    });
    launchItems.push({
      label: "Add Caption",
      onClick: () => {
        dispatch(
          librarySlice.actions.showPopup({
            title: "Add Caption",
            inputValue: currentTextBlock.caption || "",
            onSubmit: (newCaption) =>
              dispatch(
                librarySlice.actions.addCaption({
                  index: state.editor.activeTextIndex,
                  caption: newCaption,
                })
              ),
          })
        );
      },
      icon: <Bars3BottomLeftIcon className="h-4 w-4" aria-hidden="true" />,
    });
    if (currentTextBlock.caption) {
      launchItems.push({
        label: "Remove Caption",
        onClick: () => {
          dispatch(
            librarySlice.actions.addCaption({
              index: state.editor.activeTextIndex,
              caption: "",
            })
          );
        },
        icon: <Bars3BottomLeftIcon className="h-4 w-4" aria-hidden="true" />,
      });
    }

    if (currentTextBlock.reference) {
      launchItems.push({
        label: "Unmark block as reference",
        onClick: () => {
          dispatch(
            librarySlice.actions.unmarkBlockAsReference(
              state.editor.activeTextIndex
            )
          );
        },
        icon: <XMarkIcon className="h-4 w-4" aria-hidden="true" />,
      });
    } else {
      launchItems.push({
        label: "Mark block as reference",
        onClick: () => {
          dispatch(
            librarySlice.actions.markBlockAsReference(
              state.editor.activeTextIndex
            )
          );
        },
        icon: <WrenchIcon className="h-4 w-4" aria-hidden="true" />,
      });
    }
    if (currentTextBlock.open) {
      launchItems.push({
        label: "Close/Fold block",
        onClick: () => {
          dispatch(
            librarySlice.actions.closeBlock(state.editor.activeTextIndex)
          );
        },
        icon: <XMarkIcon className="h-4 w-4" aria-hidden="true" />,
      });
    } else {
      launchItems.push({
        label: "Open block",
        onClick: () => {
          dispatch(
            librarySlice.actions.openBlock(state.editor.activeTextIndex)
          );
        },
        icon: <Bars3Icon className="h-4 w-4" aria-hidden="true" />,
      });
    }
    blockTypes.forEach((blockType) => {
      if (currentTextBlock.type !== blockType) {
        launchItems.push({
          label: `Convert to ${blockType}`,
          onClick: () => {
            dispatch(
              librarySlice.actions.setBlockType({
                index: state.editor.activeTextIndex,
                type: blockType,
              })
            );
          },
          icon: <WrenchIcon className="h-4 w-4" aria-hidden="true" />,
        });
      }
    });

    languages.forEach((language) => {
      launchItems.push({
        label: `Set language to ${language}`,
        onClick: () => {
          dispatch(
            librarySlice.actions.setLanguage({
              index: state.editor.activeTextIndex,
              language,
            })
          );
        },
        icon: <WrenchIcon className="h-4 w-4" aria-hidden="true" />,
      });
    });
  }

  if (currentBook) {
    launchItems.push({
      label: "Train on book",
      onClick: async () => {
        const embed = await fd.trainOnBook(currentBook.bookid);
      },
      icon: <WrenchIcon className="h-4 w-4" aria-hidden="true" />,
    });
  }
  if (currentChapter) {
    launchItems.push({
      label: "Close/Fold all blocks",
      onClick: async () => {
        currentChapter.text.forEach((text, i) => {
          dispatch(librarySlice.actions.closeBlock(i));
        });
      },
      icon: <WrenchIcon className="h-4 w-4" aria-hidden="true" />,
    });
    launchItems.push({
      label: "Get embeddings",
      onClick: async () => {
        const embed = await fd.getEmbeddings(currentChapter);
      },
      icon: <WrenchIcon className="h-4 w-4" aria-hidden="true" />,
    });

    chapterStatuses.forEach((status) => {
      if (currentChapter.status !== status) {
        launchItems.push({
          label: `Mark as ${status.replaceAll("-", " ")}`,
          onClick: () => {
            dispatch(librarySlice.actions.setChapterStatus(status));
          },
          icon: <WrenchIcon className="h-4 w-4" aria-hidden="true" />,
        });
      }
    });

    state.books.forEach((book, i) => {
      if (book.bookid !== currentChapter.bookid) {
        launchItems.push({
          label: `Move to ${book.title}`,
          onClick: () => {
            const currentBookId = currentChapter.bookid;
            dispatch(librarySlice.actions.moveChapter(book.bookid));
            navigate(
              `/book/${book.bookid}/chapter/${currentChapter.chapterid}`
            );
          },
          icon: (
            <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden="true" />
          ),
        });
      }
    });
  }

  return (
    <Launcher
      //@ts-ignore
      items={launchItems}
      open={state.launcherOpen}
      close={onLauncherClose}
    />
  );
}
