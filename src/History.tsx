import * as Diff from "diff";
import React, { useState, useEffect } from "react";
import { produce } from "immer";
import { PencilIcon, TagIcon } from "@heroicons/react/24/solid";
import Button from "./components/Button";
import Input from "./components/Input";
import Select from "./components/Select";
import * as t from "./Types";
import Panel from "./components/Panel";

function History({
  bookid,
  chapterid,
  onSave,
  triggerHistoryRerender,
  onClick
}) {
  const [history, setHistory] = useState<t.History>([]);
  useEffect(() => {
    const func = async () => {
      const res = await fetch(`/api/getHistory/${bookid}/${chapterid}`, {
        credentials: "include"
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

  const reverseHistory = [...history].reverse();
  return (
    <div className="grid grid-cols-1 gap-3">
      {reverseHistory.map((patch, i) => (
        <Panel
          key={i}
          title="History"
          // @ts-ignore
          onClick={(e) => {
            e.stopPropagation();
            // account for history being reversed
            const newText = applyPatch(history.length - 1 - i);
            onClick(newText);
          }}
          className="cursor-pointer"
          selector="history-panel"
        >
          <pre className="text-xs xl:text-sm">{patch}</pre>
        </Panel>
      ))}
    </div>
  );
}

export default History;
