import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import * as React from "react";

import "../styles.css";

import { INSERT_COLLAPSIBLE_COMMAND } from "./CollapsiblePlugin";

export default function ToolbarPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();

  return (
    <div className="toolbar">
      <button
        onClick={() => {
          editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined);
        }}
        className={"toolbar-item spaced "}
      >
        <span className="text">Insert Collapsible Container</span>
      </button>
    </div>
  );
}
