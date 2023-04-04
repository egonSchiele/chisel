import History from "./History";
import Settings from "./Settings";
import React from "react";
import { Link } from "react-router-dom";
import Button from "./components/Button";
import SuggestionPanel from "./SuggestionPanel";
import {
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
          onDelete={onDelete}
          /* onClick={addToContents}
          onDelete={() => {
            dispatch({ type: "deleteSuggestion", payload: index });
          }} */
        />
      ))}
    </div>
  );
}

function Navigation({ onClick }) {
  return (
    <span className="isolate inline-flex rounded-md shadow-sm">
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
  );
}

type ActivePanel = "suggestions" | "settings" | "history";
export default function Sidebar({ state, settings, setSettings }) {
  const [activePanel, setActivePanel] =
    React.useState<ActivePanel>("suggestions");
  return (
    <div className={`min-h-full bg-sidebar dark:bg-dmsidebar`}>
      {/*  <div className="grid grid-rows-2 gap-3">
          <div className="px-4 flex justify-start">
            <Link to="/" className="">
              <h1 className="text-2xl font-semibold text-black dark:text-white">
                Frisson
              </h1>
            </Link>
            <div className="">
              <Button
                onClick={() => setSettingsOpen(true)}
                rounded={true}
                className="ml-xs"
              >
                Settings
              </Button>
              <Button
                onClick={() => setHistoryOpen(true)}
                rounded={true}
                className="ml-xs"
              >
                History
              </Button>
            </div>
          </div>
          <div className="ml-sm underline text-sm">
            <a href={`/book/${bookid}`}>
              <p>Back to book</p>
            </a>
          </div>
        </div> */}

      <div className="mt-5 space-y-2 dark:bg-dmsidebar px-3">
        <Navigation onClick={setActivePanel} />
        {activePanel === "suggestions" && (
          <Suggestions
            suggestions={state.suggestions}
            onClick={() => {}}
            onDelete={() => {}}
          />
        )}

        {activePanel === "history" && (
          <History chapterid={state.chapter.chapterid} onSave={() => {}} />
        )}

        {activePanel === "settings" && (
          <Settings
            settings={settings}
            setSettings={setSettings}
            onSave={() => {}}
          />
        )}
      </div>
      {/*         <div className="flex flex-shrink-0 border-t border-gray-200 p-4"> */}
    </div>
  );
}
