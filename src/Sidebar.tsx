import React from "react";
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
import NavButton from "./NavButton";
import { RootState } from "./store";
import { getSelectedChapter, librarySlice } from "./reducers/librarySlice";

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
  const width = maximize ? "w-3/4 mx-auto mt-md" : "w-48 xl:w-72";
  return (
    <div className={`${width} flex`}>
      <div className="flex-grow" />
      <div className="">
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
      </div>
      <div className="flex-grow items-end">
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

        <NavButton
          label="Close"
          onClick={maximize ? exitFullscreen : closeSidebar}
          selector="close-sidebar-button"
        >
          <XMarkIcon className="h-4 w-4 xl:h-5 xl:w-5" aria-hidden="true" />
        </NavButton>
      </div>
    </div>
  );
}

export default function Sidebar({
  settings,
  setSettings,
  usage,
  activePanel,
  setActivePanel,
  onSuggestionClick,
  onSuggestionDelete,
  onSettingsSave,
  onHistoryClick,
  triggerHistoryRerender,
  maximize,
}) {
  const state = useSelector((state: RootState) => state.library);
  const dispatch = useDispatch();
  const currentChapter = useSelector(getSelectedChapter);
  // TODO
  const infoText =
    state.editor.selectedText.length === 0
      ? currentChapter.text[0].text
      : state.editor.selectedText.contents;
  return (
    <div className="min-h-full bg-sidebar dark:bg-dmsidebarSecondary border-l border-listBorder dark:border-dmlistBorder  pb-12">
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
          <List
            title="Info"
            key="info"
            items={[<Info key="info" text={infoText} />]}
          />
        )}
        {activePanel === "suggestions" && (
          <List
            title="Suggestions"
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
                onSave={() => {}}
                triggerHistoryRerender={triggerHistoryRerender}
                onClick={(e, newText) => onHistoryClick(e, newText)}
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
                onSave={onSettingsSave}
              />,
            ]}
          />
        )}
      </div>
    </div>
  );
}
