import React from "react";
import * as JsDiff from "diff";
import Button from "./components/Button";

const DiffViewer = ({ originalText, newText, onClose }) => {
  const diff = JsDiff.diffWordsWithSpace(originalText, newText);
  const originalLines = [];
  const newLines = [];

  diff.forEach((part) => {
    const lines = part.value.split("\n");

    for (let i = 0; i < lines.length; i++) {
      if (i === lines.length - 1 && lines[i] === "") {
        continue; // Skip the last empty line
      }

      if (part.added) {
        originalLines.push("");
        newLines.push(
          <span className="bg-green-300 dark:bg-green-700">{lines[i]}</span>
        );
      } else if (part.removed) {
        originalLines.push(
          <span className="bg-red-300 dark:bg-red-700">{lines[i]}</span>
        );
        newLines.push("");
      } else {
        originalLines.push(lines[i]);
        newLines.push(lines[i]);
      }

      if (i < lines.length - 1) {
        originalLines.push(<br />);
        newLines.push(<br />);
      }
    }
  });

  return (
    <div className="">
      <Button onClick={onClose}>Close</Button>
      <div className="grid grid-cols-2 gap-4 m-md font-mono">
        <div className="p-sm bg-gray-300 dark:bg-gray-700 rounded-md">
          {originalLines}
        </div>
        <div className="p-sm bg-gray-300 dark:bg-gray-700 rounded-md">
          {newLines}
        </div>
      </div>
    </div>
  );
};

export default DiffViewer;
