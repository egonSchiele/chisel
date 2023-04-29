import React from "react";
import * as JsDiff from "diff";
import Button from "./components/Button";
import { getHtmlDiff } from "./diff";

const DiffViewer = ({ originalText, newText, onClose }) => {
  const [raw, setRaw] = React.useState(false);

  if (raw) {
    return (
      <div className="">
        <Button onClick={onClose}>Close</Button>
        <Button onClick={() => setRaw(false)}>Formatted</Button>
        <div className="grid grid-cols-1 m-md font-mono">
          {JsDiff.diffChars(originalText, newText).map((part, i) => {
            return <pre key={i}>{JSON.stringify(part, null, 2)}</pre>;
          })}
        </div>
      </div>
    );
  }
  const { originalLines, newLines } = getHtmlDiff(originalText, newText);

  return (
    <div className="">
      <Button onClick={onClose}>Close</Button>
      <Button onClick={() => setRaw(true)}>Raw</Button>
      <div className="grid grid-cols-2 gap-4 m-md font-mono">
        <div className="p-sm bg-gray-100 dark:bg-gray-700 rounded-md">
          {originalLines}
        </div>
        <div className="p-sm bg-gray-100 dark:bg-gray-700 rounded-md">
          {newLines}
        </div>
      </div>
    </div>
  );
};

export default DiffViewer;
