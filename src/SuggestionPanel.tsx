import React from "react";
import Panel from "./components/Panel";

export default function SuggestionPanel({ title, contents, onClick }) {
  return (
    <Panel title={title} onClick={() => onClick(contents)}>
      <p className="text-sm">{contents}</p>
    </Panel>
  );
}
