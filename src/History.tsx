import React, { useState, useEffect } from "react";
import { produce } from "immer";
import Button from "./components/Button";
import Input from "./components/Input";
import Select from "./components/Select";
import * as t from "./Types";
import { PencilIcon, TagIcon } from "@heroicons/react/24/solid";
import Panel from "./components/Panel";

const History = ({ chapterid, onSave, triggerHistoryRerender }) => {
  const [history, setHistory] = useState<t.History>([]);
console.log("rerendering history");
  useEffect(() => {
    const func = async () => {
      const res = await fetch(`/api/getHistory/${chapterid}`, {
        credentials: "include",
      });
      if (!res.ok) {
        console.log(res.statusText);
        //dispatch({ type: "setError", payload: res.statusText });
        return;
      }
      const data = await res.json();
      console.log("got history");
      console.log(data);
      setHistory(data.reverse());
    };
    func();
  }, [triggerHistoryRerender]);
  return (
    <div className="grid grid-cols-1 gap-3">      
      {history.map((patch, i) => (
        <Panel key={i} title="History">
          <pre className="text-xs xl:text-sm">{patch}</pre>
        </Panel>
      ))}
    </div>
  );
};

export default History;
