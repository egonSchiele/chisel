import React from "react";
import Panel from "./components/Panel";

export default function SuggestionPanel({ title, contents, onClick }) {
  return (
    <Panel
      className="cursor-pointer"
      title={title}
      onClick={() => onClick(contents)}
    >
      <p className="text-sm">{contents}</p>
    </Panel>
  );
}
