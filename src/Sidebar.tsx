import History from "./History";
import Settings from "./Settings";
import React from "react";
import { Link } from "react-router-dom";
import Button from "./components/Button";
import SuggestionPanel from "./SuggestionPanel";
import {
  ChevronLeftIcon,
  ClipboardIcon,
  ClockIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

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

function Navigation({ onClick, closeSidebar }) {
  return (
    <div className="flex">
      <div className="flex-none">
        <button
          type="button"
          className="relative rounded-md inline-flex items-center bg-white px-2 py-2 text-gray-400  hover:bg-gray-50 ring-0"
          onClick={closeSidebar}
        >
          <span className="sr-only">Close</span>
          <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <div className="flex flex-grow" />
      <span className="isolate flex-none rounded-md shadow-sm">
        <button
          type="button"
          className="relative inline-flex items-center rounded-l-md bg-white px-2 py-2 text-gray-400  hover:bg-gray-50 ring-0"
          onClick={() => onClick("suggestions")}
        >
          <span className="sr-only">Suggestions</span>
          <ClipboardIcon className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="relative -ml-px inline-flex items-center bg-white px-2 py-2 text-gray-400  hover:bg-gray-50 ring-0"
          onClick={() => onClick("history")}
        >
          <span className="sr-only">History</span>
          <ClockIcon className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="relative -ml-px inline-flex items-center rounded-r-md bg-white px-2 py-2 text-gray-400  hover:bg-gray-50 ring-0"
          onClick={() => onClick("settings")}
        >
          <span className="sr-only">Settings</span>
          <Cog6ToothIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </span>
    </div>
  );
}

type ActivePanel = "suggestions" | "settings" | "history";
export default function Sidebar({
  state,
  settings,
  setSettings,
  closeSidebar,
  onSuggestionClick,
  onSuggestionDelete,
  onSettingsSave,
}) {
  const [activePanel, setActivePanel] =
    React.useState<ActivePanel>("suggestions");
  return (
    <div className={`min-h-full bg-sidebar dark:bg-dmsidebarSecondary`}>
      <div className="pt-sm space-y-2  px-3">
        <Navigation onClick={setActivePanel} closeSidebar={closeSidebar} />
        {activePanel === "suggestions" && (
          <Suggestions
            suggestions={state.suggestions}
            onClick={onSuggestionClick}
            onDelete={onSuggestionDelete}
          />
        )}

        {activePanel === "history" && (
          <History chapterid={state.chapter.chapterid} onSave={() => {}} />
        )}

        {activePanel === "settings" && (
          <Settings
            settings={settings}
            setSettings={setSettings}
            onSave={onSettingsSave}
          />
        )}
      </div>
      {/*         <div className="flex flex-shrink-0 border-t border-gray-200 p-4"> */}
    </div>
  );
}
