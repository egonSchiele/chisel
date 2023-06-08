import {
  Bars3Icon,
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronLeftIcon,
  DocumentDuplicateIcon,
  EllipsisHorizontalCircleIcon,
  EyeIcon,
  MinusIcon,
  PencilIcon,
  SparklesIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";
import React, { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import LibErrorBoundary from "./LibErrorBoundary";
import LibraryContext from "./LibraryContext";
import Tabs from "./Tabs";
import * as t from "./Types";
import NavButton from "./components/NavButton";
import Spinner from "./components/Spinner";
import * as fd from "./lib/fetchData";
import { useColors } from "./lib/hooks";
import { getSelectedChapter, librarySlice } from "./reducers/librarySlice";
import { AppDispatch, RootState } from "./store";
// import { AudioRecorder } from "react-audio-voice-recorder";
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
  const { settings } = useContext(LibraryContext) as t.LibraryContextType;

  const addAudioElement = async (blob) => {
    console.log("hi");
    const res = await fd.uploadAudio(blob);
    console.log(res);
    /* const url = URL.createObjectURL(blob);
    const audio = document.createElement("audio");
    audio.src = url;
    audio.controls = true;
    document.body.appendChild(audio); */
  };

  if (!loaded) {
    return (
      <div
        className={`h-9 w-full absolute left-0 top-0 z-50 flex-grow ${colors.navBackgroundColor} animate-pulse`}
        id="nav"
      ></div>
    );
  }
  const fromCache = state.fromCache;
  return (
    <div
      className={`h-9 w-screen absolute left-0 top-0 z-50 flex-grow ${
        colors.navBackgroundColor
      } align-middle ${fromCache && "border-t-2 border-blue-800"}`}
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
                color="nav"
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
                color="nav"
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
                color="nav"
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
                color="nav"
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
            color="nav"
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
              color="nav"
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
              <NavButton color="nav" label="Unsaved" onClick={() => {}}>
                <MinusIcon className="h-5 w-5" aria-hidden="true" />
              </NavButton>
            )}

            {state.saved && !state.serviceWorkerRunning && (
              <NavButton color="nav" label="Saved" onClick={() => {}}>
                <CheckCircleIcon
                  className={`h-5 w-5 ${colors.highlightTextColor}`}
                  aria-hidden="true"
                />
              </NavButton>
            )}
            {state.saved && state.serviceWorkerRunning && (
              <NavButton color="nav" label="Saved" onClick={() => {}}>
                <CheckIcon
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
                <NavButton
                  color="nav"
                  label="Loading"
                  onClick={() => {}}
                  className="p-0"
                >
                  <Spinner className="w-5 h-5" />
                </NavButton>
              )}

              {/*               {state.editor.selectedText &&
                state.editor.selectedText.length > 0 && (
                  <NavButton
                  color="nav"
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
                <NavButton color="nav" label="Unsaved" onClick={() => {}}>
                  <MinusIcon className="h-5 w-5" aria-hidden="true" />
                </NavButton>
              )}

              {state.saved && !state.serviceWorkerRunning && (
                <NavButton color="nav" label="Saved" onClick={() => {}}>
                  <CheckCircleIcon
                    className={`h-5 w-5 ${colors.highlightTextColor}`}
                    aria-hidden="true"
                  />
                </NavButton>
              )}
              {state.saved && state.serviceWorkerRunning && (
                <NavButton color="nav" label="Saved" onClick={() => {}}>
                  <CheckIcon
                    className={`h-5 w-5 ${colors.highlightTextColor}`}
                    aria-hidden="true"
                  />
                </NavButton>
              )}

              {state.viewMode !== "readonly" && (
                <NavButton
                  color="nav"
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
                  color="nav"
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
                    color="nav"
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
                  color="nav"
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
                    color="nav"
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
                    color="nav"
                    label="Chat"
                    onClick={() => {
                      dispatch(librarySlice.actions.toggleChat());
                    }}
                    selector="chat-button"
                  >
                    <ChatBubbleLeftIcon
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </NavButton>

                  {/* {settings.admin && (
                    <AudioRecorder
                      onRecordingComplete={addAudioElement}
                      audioTrackConstraints={{
                        noiseSuppression: true,
                        echoCancellation: true,
                      }}
                      downloadOnSavePress={true}
                      downloadFileExtension="mp3"
                    />
                  )} */}
                </>
              )}
            </div>
          </LibErrorBoundary>
        )}
      </div>
    </div>
  );
}
