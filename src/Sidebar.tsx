import React, { useContext } from "react";
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  ClipboardIcon,
  ClockIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from "react-redux";
import History from "./History";
import Settings from "./Settings";
import SuggestionPanel from "./SuggestionPanel";
import Info from "./Info";
import List from "./components/List";
import NavButton from "./components/NavButton";
import { RootState } from "./store";
import {
  getChapter,
  getSelectedChapter,
  librarySlice,
} from "./reducers/librarySlice";
import { getChapterText } from "./utils";
import LibraryContext from "./LibraryContext";
import { LibraryContextType } from "./Types";
import { useColors } from "./lib/hooks";

function Suggestions({ suggestions, onClick, onDelete }) {
  return (
    <div>
      {suggestions.map((suggestion, index) => (
        <SuggestionPanel
          key={index}
          title={suggestion.type}
          contents={suggestion.contents}
          onClick={onClick}
          onDelete={() => onDelete(index)}
        />
      ))}
    </div>
  );
}

function Navigation({
  onClick,
  closeSidebar,
  maximize,
  fullscreen,
  exitFullscreen,
}) {
  const width = maximize ? "w-3/4 mx-auto mt-md" : "w-48 2xl:w-72";
  return (
    <div className={`${width} flex h-8`}>
      <div className="w-full flex items-center">
        <div className="flex-grow" />
        <NavButton
          label="Info"
          onClick={() => onClick("info")}
          selector="info-button"
        >
          <InformationCircleIcon
            className="h-4 w-4 xl:h-5 xl:w-5"
            aria-hidden="true"
          />
        </NavButton>
        <NavButton
          label="Suggestions"
          onClick={() => onClick("suggestions")}
          selector="suggestions-button"
        >
          <ClipboardIcon className="h-4 w-4 xl:h-5 xl:w-5" aria-hidden="true" />
        </NavButton>
        <NavButton
          label="History"
          onClick={() => onClick("history")}
          selector="history-button"
        >
          <ClockIcon className="h-4 w-4 xl:h-5 xl:w-5" aria-hidden="true" />
        </NavButton>
        <NavButton
          label="Settings"
          onClick={() => onClick("settings")}
          selector="settings-button"
        >
          <Cog6ToothIcon className="h-4 w-4 xl:h-5 xl:w-5" aria-hidden="true" />
        </NavButton>
        {maximize && (
          <NavButton
            label="Minimize"
            onClick={exitFullscreen}
            selector="minimize-button"
          >
            <ArrowsPointingInIcon
              className="h-4 w-4 xl:h-5 xl:w-5"
              aria-hidden="true"
            />
          </NavButton>
        )}
        {!maximize && (
          <NavButton
            label="Maximize"
            onClick={fullscreen}
            selector="maximize-button"
          >
            <ArrowsPointingOutIcon
              className="h-4 w-4 xl:h-5 xl:w-5"
              aria-hidden="true"
            />
          </NavButton>
        )}

        {maximize && (
          <NavButton
            label="Close"
            onClick={exitFullscreen}
            selector="close-sidebar-button"
          >
            <XMarkIcon className="h-4 w-4 xl:h-5 xl:w-5" aria-hidden="true" />
          </NavButton>
        )}
        <div className="flex-grow" />
      </div>
    </div>
  );
}

export default function Sidebar({
  onSuggestionClick,
  onHistoryClick,
  triggerHistoryRerender,
  addToHistory,
}) {
  const state = useSelector((state: RootState) => state.library);
  const dispatch = useDispatch();
  const currentChapter = useSelector(getSelectedChapter);

  const activePanel = useSelector(
    (state: RootState) => state.library.panels.rightSidebar.activePanel
  );
  const colors = useColors();

  const maximize = useSelector(
    (state: RootState) => state.library.viewMode === "fullscreen"
  );
  const { settings, setSettings, usage } = useContext(
    LibraryContext
  ) as LibraryContextType;

  function setActivePanel(panel) {
    dispatch(librarySlice.actions.setActivePanel(panel));
  }

  const onSuggestionDelete = (index) => {
    dispatch(librarySlice.actions.deleteSuggestion(index));
  };

  if (!currentChapter) {
    return null;
  }

  return (
    <div
      className={`min-h-full ${colors.background} ${!maximize && "border-l"} ${
        colors.borderColor
      } dark:[color-scheme:dark] pb-12`}
    >
      <div className="pt-xs">
        <Navigation
          onClick={setActivePanel}
          closeSidebar={() => dispatch(librarySlice.actions.closeSidebar())}
          maximize={maximize}
          fullscreen={() =>
            dispatch(librarySlice.actions.setViewMode("fullscreen"))
          }
          exitFullscreen={() =>
            dispatch(librarySlice.actions.setViewMode("default"))
          }
        />
        {activePanel === "info" && (
          <List title="Chapter Info" key="info" items={[<Info key="info" />]} />
        )}
        {activePanel === "suggestions" && (
          <List
            title="Suggestions"
            className=""
            items={[
              <Suggestions
                key="suggestions"
                suggestions={state.suggestions}
                onClick={onSuggestionClick}
                onDelete={onSuggestionDelete}
              />,
            ]}
          />
        )}

        {activePanel === "history" && (
          <List
            title="History"
            items={[
              <History
                key="history"
                chapterid={currentChapter.chapterid}
                bookid={currentChapter.bookid}
                triggerHistoryRerender={triggerHistoryRerender}
                onClick={(e, newText) => onHistoryClick(e, newText)}
                addToHistory={addToHistory}
              />,
            ]}
          />
        )}

        {activePanel === "settings" && (
          <List
            title="Settings"
            items={[
              <Settings
                key="settings"
                settings={settings}
                usage={usage}
                setSettings={setSettings}
                onSave={() => {}}
              />,
            ]}
          />
        )}
      </div>
    </div>
  );
}
