import History from "./History";
import Settings from "./Settings";
import React from "react";
import { Link } from "react-router-dom";
import Button from "./components/Button";
import SuggestionPanel from "./SuggestionPanel";
import {
  ChevronRightIcon,
  ClipboardIcon,
  ClockIcon,
  Cog6ToothIcon,
  Cog8ToothIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import Info from "./Info";
import { useLocalStorage } from "./utils";
import List from "./components/List";

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

function NavButton({ label, onClick, children, className="" }) {
  return (
    <button
      type="button"
      className={`relative inline-flex items-center bg-white px-1 text-gray-400  hover:bg-gray-50 ring-0 bg-dmsidebarSecondary dark:hover:bg-dmsidebar ${
        className 
      }`}
      onClick={onClick}
    >
                <span className="sr-only">{label}</span>
      {children}
    </button>
  );
}

function Navigation({ onClick, closeSidebar }) {
  return (
    <div className="w-48 xl:w-48 items-center">
      <div className="">
        <NavButton label="Close" onClick={closeSidebar}>
        <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
        </NavButton>
        <NavButton label="Info" onClick={() => onClick("info")}>
          <InformationCircleIcon className="h-4 w-4" aria-hidden="true" />
        </NavButton>       
        <NavButton label="Suggestions" onClick={() => onClick("suggestions")}>
          <ClipboardIcon className="h-4 w-4" aria-hidden="true" />
        </NavButton>       
        <NavButton label="History" onClick={() => onClick("history")}>
          <ClockIcon className="h-4 w-4" aria-hidden="true" />
        </NavButton>       
        <NavButton label="Settings" onClick={() => onClick("settings")}>
          <Cog6ToothIcon className="h-4 w-4" aria-hidden="true" />
        </NavButton>       
      </div>      
    </div>
  );
}

type ActivePanel = "info" | "suggestions" | "settings" | "history";
export default function Sidebar({
  state,
  settings,
  setSettings,
  closeSidebar,
  onSuggestionClick,
  onSuggestionDelete,
  onSettingsSave,
  triggerHistoryRerender,
}) {
  const [activePanel, setActivePanel] = useLocalStorage("activePanel", "suggestions")
    const infoText = state.editor.selectedText.length === 0 ? state.editor.text : state.editor.selectedText.contents;
  return (
    <div className={`min-h-full bg-sidebar dark:bg-dmsidebarSecondary border-l border-listBorder dark:border-dmlistBorder`}>
      <div className="pt-xs">
        <Navigation onClick={setActivePanel} closeSidebar={closeSidebar} />
        {activePanel === "info" && (
          
          <List title="Info" items={[<Info text={infoText} />]} />
          
        )}
        {activePanel === "suggestions" && (
          <List title="Suggestions" items={[
          <Suggestions
            suggestions={state.suggestions}
            onClick={onSuggestionClick}
            onDelete={onSuggestionDelete}
          />]} />
        )}

        {activePanel === "history" && (
          <List title="History" items={[
          <History chapterid={state.chapter.chapterid} onSave={() => {}} triggerHistoryRerender={triggerHistoryRerender} />
          ]} />
        )}

        {activePanel === "settings" && (
          <List title="Settings" items={[
          <Settings
            settings={settings}
            setSettings={setSettings}
            onSave={onSettingsSave}
          />
          ]} />
        )}
      </div>
      {/*         <div className="flex flex-shrink-0 border-t border-gray-200 p-4"> */}
    </div>
  );
}
