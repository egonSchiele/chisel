import {
  Bars3Icon,
  ChatBubbleOvalLeftIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentDuplicateIcon,
  EllipsisHorizontalCircleIcon,
  EyeIcon,
  MinusIcon,
  PencilIcon,
  ScissorsIcon,
  SparklesIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import LibErrorBoundary from "./LibErrorBoundary";
import * as t from "./Types";
import NavButton from "./components/NavButton";
import Spinner from "./components/Spinner";
import { getSelectedChapter, librarySlice } from "./reducers/librarySlice";
import { AppDispatch, RootState } from "./store";
import Tabs from "./Tabs";
import { useColors } from "./lib/hooks";
export default function Nav({
  mobile,
  bookid,
  chapterid,
}: {
  mobile: boolean;
  bookid?: string;
  chapterid?: string;
}) {
  const state: t.State = useSelector((state: RootState) => state.library);
  const loaded = state.booksLoaded;
  const currentChapter = getSelectedChapter({ library: state });
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const colors = useColors();
  if (!loaded) {
    return (
      <div
        className="h-9 w-full absolute left-0 top-0 z-50 flex-grow bg-gray-100 dark:bg-gray-700 animate-pulse"
        id="nav"
      ></div>
    );
  }
  return (
    <div
      className="h-9 w-screen absolute left-0 top-0 z-50 flex-grow bg-gray-100 dark:bg-gray-700 align-middle"
      id="nav"
    >
      <div className="h-full flex align-middle">
        <div className="h-full flex-none align-middle">
          {!mobile && currentChapter && (
            <>
              <button
                onClick={() => {
                  dispatch(librarySlice.actions.openFileNavigator());
                }}
                className="hidden"
                data-selector="open-file-navigator-for-cypress"
              ></button>
              <NavButton
                label="File Navigator"
                onClick={() => {
                  dispatch(librarySlice.actions.toggleFileNavigator());
                }}
                className="p-0"
                selector="open-lists-button"
                selected={
                  state.panels.leftSidebar.open &&
                  state.panels.leftSidebar.activePanel === "filenavigator"
                }
              >
                <DocumentDuplicateIcon className="h-5 w-5" aria-hidden="true" />
              </NavButton>
              <NavButton
                label="Prompts"
                onClick={() => {
                  dispatch(librarySlice.actions.togglePrompts());
                }}
                className="p-0"
                selector="prompts-button"
                selected={
                  state.panels.leftSidebar.open &&
                  state.panels.leftSidebar.activePanel === "prompts"
                }
              >
                <SparklesIcon className="h-5 w-5" aria-hidden="true" />
              </NavButton>

              <NavButton
                label="Blocks"
                onClick={() => {
                  dispatch(librarySlice.actions.toggleBlocks());
                }}
                className="p-0"
                selector="blocks-button"
                selected={
                  state.panels.leftSidebar.open &&
                  state.panels.leftSidebar.activePanel === "blocks"
                }
              >
                <TableCellsIcon className="h-5 w-5" aria-hidden="true" />
              </NavButton>

              <NavButton
                label="Outline"
                onClick={() => {
                  dispatch(librarySlice.actions.toggleOutline());
                }}
                className="p-0"
                selector="outline-button"
                selected={
                  state.panels.leftSidebar.open &&
                  state.panels.leftSidebar.activePanel === "outline"
                }
              >
                <Bars3Icon className="h-5 w-5" aria-hidden="true" />
              </NavButton>
            </>
          )}

          {/*           {state.panels.leftSidebar.open && !mobile && currentChapter && (
            <NavButton
              label="Close"
              onClick={() => {
                dispatch(librarySlice.actions.closeFileNavigator());
                dispatch(librarySlice.actions.closeFileNavigator());
              }}
              className="p-0"
              selector="close-lists-button"
            >
              <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
              <p className="uppercase text-xs align-baseline">Close</p>
            </NavButton>
          )} */}

          {mobile && (
            <NavButton
              label="Open"
              onClick={() => {
                navigate(`/book/${state.selectedBookId}`);
              }}
              className="p-0"
              selector="open-lists-button"
            >
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </NavButton>
          )}
        </div>

        <div className="flex-grow w-[calc(100%-50rem)] overflow-x-scroll">
          <Tabs />
        </div>

        {/* book editor nav */}
        {bookid && !chapterid && (
          <div className="mr-xs">
            {!state.saved && (
              <NavButton label="Unsaved" onClick={() => {}}>
                <MinusIcon className="h-5 w-5" aria-hidden="true" />
              </NavButton>
            )}

            {state.saved && (
              <NavButton label="Saved" onClick={() => {}}>
                <CheckCircleIcon
                  className={`h-5 w-5 ${colors.highlightTextColor}`}
                  aria-hidden="true"
                />
              </NavButton>
            )}
          </div>
        )}

        {/* right side nav */}
        {chapterid && (
          <LibErrorBoundary component="navigation">
            <div className="flex-none">
              {state.loading && (
                <NavButton label="Loading" onClick={() => {}} className="p-0">
                  <Spinner className="w-5 h-5" />
                </NavButton>
              )}

              {/*               {state.editor.selectedText &&
                state.editor.selectedText.length > 0 && (
                  <NavButton
                    label="Extract Block"
                    onClick={() => {
                      dispatch(librarySlice.actions.extractBlock());
                    }}
                  >
                    <ScissorsIcon className="h-5 w-5" aria-hidden="true" />
                  </NavButton>
                )} */}

              {state.viewMode === "readonly" && (
                <span className="text-gray-500 dark:text-gray-300 text-xs uppercase mr-xs inline-block align-middle h-6">
                  read only
                </span>
              )}
              {state.viewMode === "focus" && (
                <span className="text-gray-500 dark:text-gray-300 text-xs uppercase mr-xs inline-block align-middle h-6">
                  focus mode
                </span>
              )}
              {!state.saved && (
                <NavButton label="Unsaved" onClick={() => {}}>
                  <MinusIcon className="h-5 w-5" aria-hidden="true" />
                </NavButton>
              )}

              {state.saved && (
                <NavButton label="Saved" onClick={() => {}}>
                  <CheckCircleIcon
                    className={`h-5 w-5 ${colors.highlightTextColor}`}
                    aria-hidden="true"
                  />
                </NavButton>
              )}

              {state.viewMode !== "readonly" && (
                <NavButton
                  label="Read only"
                  onClick={() =>
                    dispatch(librarySlice.actions.setViewMode("readonly"))
                  }
                  selector="readonly-open"
                >
                  <PencilIcon className="h-5 w-5" aria-hidden="true" />
                </NavButton>
              )}
              {state.viewMode === "readonly" && (
                <NavButton
                  label="Exit read only"
                  onClick={() =>
                    dispatch(librarySlice.actions.setViewMode("default"))
                  }
                  selector="readonly-close"
                >
                  <PencilIcon
                    className={`h-5 w-5 ${colors.highlightTextColor}`}
                    aria-hidden="true"
                  />
                </NavButton>
              )}

              {!mobile && (
                <>
                  <NavButton
                    label="Focus Mode"
                    onClick={() =>
                      dispatch(librarySlice.actions.toggleViewMode("focus"))
                    }
                  >
                    <EyeIcon
                      className={`h-5 w-5 ${
                        state.viewMode === "focus" &&
                        "text-blue-700 dark:text-blue-400"
                      }`}
                      aria-hidden="true"
                    />
                  </NavButton>

                  {/*   <NavButton
                    label="Prompts"
                    onClick={() => {
                      dispatch(librarySlice.actions.togglePrompts());
                      if (!state.panels.prompts.open) {
                        dispatch(librarySlice.actions.closeFileNavigator());
                      }
                    }}
                    selector="prompts-button"
                  >
                    <SparklesIcon className="h-5 w-5" aria-hidden="true" />
                  </NavButton> */}

                  <NavButton
                    label="Sidebar"
                    onClick={() => {
                      dispatch(librarySlice.actions.toggleRightSidebar());
                    }}
                    selector="sidebar-button"
                  >
                    <EllipsisHorizontalCircleIcon
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </NavButton>
                  <NavButton
                    label="Chat"
                    onClick={() => {
                      dispatch(librarySlice.actions.toggleChat());
                    }}
                    selector="chat-button"
                  >
                    <ChatBubbleOvalLeftIcon
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </NavButton>
                </>
              )}
            </div>
          </LibErrorBoundary>
        )}
      </div>
    </div>
  );
}
