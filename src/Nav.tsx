import {
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalCircleIcon,
  EyeIcon,
  MinusIcon,
  PencilIcon,
  ScissorsIcon,
  SparklesIcon,
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
  if (!loaded) {
    return (
      <div
        className="h-8 w-full absolute left-0 top-0 z-50 flex-grow bg-gray-800 animate-pulse"
        id="nav"
      ></div>
    );
  }
  return (
    <div
      className="h-8 w-full absolute left-0 top-0 z-50 flex-grow bg-gray-800"
      id="nav"
    >
      <div className=" m-xs flex">
        <div className="flex-none">
          {(!state.panels.bookList.open || !state.panels.chapterList.open) &&
            !mobile &&
            currentChapter && (
              <NavButton
                label="Open"
                onClick={() => {
                  dispatch(librarySlice.actions.openBookList());
                  dispatch(librarySlice.actions.openChapterList());
                }}
                className="p-0"
                selector="open-lists-button"
              >
                <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
                <p className="uppercase text-xs align-baseline">Open</p>
              </NavButton>
            )}

          {state.panels.bookList.open &&
            state.panels.chapterList.open &&
            !mobile &&
            currentChapter && (
              <NavButton
                label="Close"
                onClick={() => {
                  dispatch(librarySlice.actions.closeBookList());
                  dispatch(librarySlice.actions.closeChapterList());
                }}
                className="p-0"
                selector="close-lists-button"
              >
                <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
                <p className="uppercase text-xs align-baseline">Close</p>
              </NavButton>
            )}

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

        <div className="flex-grow" />

        {/* book editor nav */}
        {bookid && !chapterid && (
          <div className="mr-sm mt-xs">
            {!state.saved && (
              <NavButton label="Unsaved" onClick={() => {}}>
                <MinusIcon className="h-5 w-5" aria-hidden="true" />
              </NavButton>
            )}

            {state.saved && (
              <NavButton label="Saved" onClick={() => {}}>
                <CheckCircleIcon
                  className="h-5 w-5 text-blue-700 dark:text-blue-400"
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

              {state.editor.selectedText &&
                state.editor.selectedText.length > 0 && (
                  <NavButton
                    label="Extract Block"
                    onClick={() => {
                      dispatch(librarySlice.actions.extractBlock());
                    }}
                  >
                    <ScissorsIcon className="h-5 w-5" aria-hidden="true" />
                  </NavButton>
                )}

              {state.viewMode === "readonly" && (
                <span className="text-gray-300 dark:text-gray-500 text-xs uppercase mr-xs inline-block align-middle h-6">
                  read only
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
                    className="h-5 w-5 text-blue-700 dark:text-blue-400"
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
                    className="h-5 w-5 text-red-700"
                    aria-hidden="true"
                  />
                </NavButton>
              )}

              {!mobile && (
                <>
                  <NavButton
                    label="Focus Mode"
                    onClick={() =>
                      dispatch(librarySlice.actions.setViewMode("focus"))
                    }
                  >
                    <EyeIcon className="h-5 w-5" aria-hidden="true" />
                  </NavButton>

                  <NavButton
                    label="Prompts"
                    onClick={() => {
                      dispatch(librarySlice.actions.togglePrompts());
                      if (!state.panels.prompts.open) {
                        dispatch(librarySlice.actions.closeBookList());
                        dispatch(librarySlice.actions.closeChapterList());
                      }
                    }}
                    selector="prompts-button"
                  >
                    <SparklesIcon className="h-5 w-5" aria-hidden="true" />
                  </NavButton>

                  <NavButton
                    label="Sidebar"
                    onClick={() => {
                      dispatch(librarySlice.actions.toggleSidebar());
                      if (!state.panels.sidebar.open) {
                        dispatch(librarySlice.actions.closeBookList());
                        dispatch(librarySlice.actions.closeChapterList());
                      }
                    }}
                    selector="sidebar-button"
                  >
                    <EllipsisHorizontalCircleIcon
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
