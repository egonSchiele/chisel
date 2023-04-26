import * as Diff from "diff";
import _ from "lodash";
import React, { useState, useEffect } from "react";
import { produce } from "immer";
import { PencilIcon, TagIcon } from "@heroicons/react/24/solid";
import Button from "./components/Button";
import Input from "./components/Input";
import Select from "./components/Select";
import * as t from "./Types";
import Panel from "./components/Panel";
import { getHtmlDiff } from "./utils";
import { useSelector } from "react-redux";
import { RootState } from "./store";

function HistoryPanel({ index, patch, nextPatch, rawPatch, onClick }) {
  const viewMode = useSelector((state: RootState) => state.library.viewMode);
  const fullscreen = viewMode === "fullscreen";

  if (!fullscreen) {
    return (
      <Panel
        title="History"
        // @ts-ignore
        onClick={(e) => {
          e.stopPropagation();
          onClick(e, patch);
        }}
        className="cursor-pointer"
        selector="history-panel"
      >
        <pre className="text-xs xl:text-sm">{rawPatch}</pre>
      </Panel>
    );
  }

  const { originalLines, newLines } = getHtmlDiff(patch, nextPatch, true);
  return (
    <Panel
      title="History"
      // @ts-ignore
      onClick={(e) => {
        e.stopPropagation();
        onClick(e, patch);
      }}
      className="cursor-pointer"
      selector="history-panel"
    >
      <div className="grid grid-cols-2 gap-4 m-md font-mono">
        <div className="p-sm bg-gray-300 dark:bg-gray-700 rounded-md">
          {originalLines}
        </div>
        <div className="p-sm bg-gray-300 dark:bg-gray-700 rounded-md">
          {newLines}
        </div>
      </div>
    </Panel>
  );
}

function History({
  bookid,
  chapterid,
  onSave,
  triggerHistoryRerender,
  onClick,
}) {
  const [history, setHistory] = useState<t.History>([]);
  useEffect(() => {
    const func = async () => {
      const res = await fetch(`/api/getHistory/${bookid}/${chapterid}`, {
        credentials: "include",
      });
      if (!res.ok) {
        console.log(res.statusText);
        // dispatch({ type: "SET_ERROR", payload: res.statusText });
        return;
      }
      const data = await res.json();
      setHistory(data);
    };
    func();
  }, [chapterid, triggerHistoryRerender]);

  const applyPatch = (index) => {
    if (index < 0) return "";
    if (!history || !history[index]) return "";
    let old = history[0];
    if (index === 0) return old;

    history.slice(1, index + 1).forEach((patch) => {
      const result = Diff.applyPatch(old, patch);
      if (result) old = result;
    });
    return old;
  };

  if (!history || history.length === 0) return <p>No history</p>;
  const reverseHistory = [...history].reverse();
  const patches = reverseHistory.map((_, i) =>
    applyPatch(history.length - 1 - i)
  );
  return (
    <div className="grid grid-cols-1 gap-3">
      {_.range(1, reverseHistory.length + 1).map((i) => (
        <HistoryPanel
          key={i}
          index={i}
          onClick={onClick}
          patch={i === reverseHistory.length ? "" : patches[i]}
          nextPatch={i > 0 ? patches[i - 1] : ""}
          rawPatch={reverseHistory[i - 1]}
        />
      ))}
    </div>
  );
}

export default History;
