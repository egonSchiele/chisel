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
import { NavButton } from "./NavButton";

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
          
          <List title="Info" key={"info"} items={[<Info text={infoText} />]} />
          
        )}
        {activePanel === "suggestions" && (
          <List title="Suggestions" items={[
          <Suggestions
            key={"suggestions"}
            suggestions={state.suggestions}
            onClick={onSuggestionClick}
            onDelete={onSuggestionDelete}
          />]} />
        )}

        {activePanel === "history" && (
          <List title="History" items={[
          <History key={"history"} chapterid={state.chapter.chapterid} bookid={state.chapter.bookid} onSave={() => {}} triggerHistoryRerender={triggerHistoryRerender} />
          ]} />
        )}

        {activePanel === "settings" && (
          <List title="Settings" items={[
          <Settings
          key={"settings"}
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
