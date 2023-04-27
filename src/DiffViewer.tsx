import React from "react";

import Button from "./components/Button";
import { getHtmlDiff } from "./diff";

const DiffViewer = ({ originalText, newText, onClose }) => {
  const { originalLines, newLines } = getHtmlDiff(originalText, newText);
  return (
    <div className="">
      <Button onClick={onClose}>Close</Button>
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
