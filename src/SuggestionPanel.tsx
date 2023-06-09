import React from "react";
import Panel from "./components/Panel";

export default function SuggestionPanel({
  title,
  contents,
  onClick,
  onDelete,
}) {
  return (
    <Panel
      className="cursor-pointer"
      title={title}
      onClick={() => onClick(contents)}
      onDelete={onDelete}
      selector="ai-suggestion-panel"
    >
      <p>{contents}</p>
    </Panel>
  );
}
