import React from "react";
import * as JsDiff from "diff";
type Diff = {
  value: string;
  added?: boolean;
  removed?: boolean;
};
function makeDiff(value, type: "added" | "removed" | "same"): Diff[] {
  const obj: Diff = {
    value,
  };
  if (type === "added") {
    obj.added = true;
  }
  if (type === "removed") {
    obj.removed = true;
  }
  return [obj];
}

export function getHtmlDiff(originalText, newText, changesOnly = false) {
  let diff: Diff[] = [];
  if (originalText === "") {
    diff = makeDiff(newText, "added");
  } else if (newText === "") {
    diff = makeDiff(originalText, "removed");
  } else if (originalText === newText) {
    diff = makeDiff(originalText, "same");
  } else {
    diff = JsDiff.diffWordsWithSpace(originalText, newText);
  }
  const originalLines = [];
  const newLines = [];

  let parts = [];
  const context = 5;
  diff.forEach((part, i) => {
    if (!changesOnly) {
      parts.push(part);
    } else if (part.added || part.removed) {
      parts.push(part);
      /* } else if (i > 1 && (diff[i - 2].added || diff[i - 2].removed)) {
        parts.push(part);
       */
    } else {
      const lines = part.value.split("\n");
      const prev = diff[Math.max(0, i - 1)];
      const prevPartModified = prev.added || prev.removed;

      const next = diff[Math.min(diff.length - 1, i + 1)];
      const nextPartModified = next.added || next.removed;

      if (prevPartModified || nextPartModified) {
        if (
          prevPartModified &&
          nextPartModified &&
          lines.length <= context * 2
        ) {
          parts.push(part);
        } else {
          let str = "";
          if (prevPartModified) {
            const contextLines = lines.slice(0, context);

            const joined = contextLines.join("\n");
            if (joined.match(/^\s+$/)) {
              str = "";
            } else {
              str = joined + "...";
            }
          }
          if (prevPartModified && nextPartModified) {
            str += "...";
          }
          if (nextPartModified) {
            const contextLines = lines.slice(
              Math.max(0, lines.length - context),
              lines.length
            );

            const joined = contextLines.join("\n");
            if (joined.match(/^\s+$/)) {
              str = "";
            } else {
              str = "..." + joined;
            }
          }
          part.value = str;
          parts.push(part);
        }
      }
    }
  });
  let key = 0;
  parts.forEach((part) => {
    //const str = "START\n" + part.value + "\nEND";
    const str = part.value;
    const lines = str.split("\n");

    for (let i = 0; i < lines.length; i++) {
      key += 1;
      if (i === lines.length - 1 && lines[i] === "") {
        continue; // Skip the last empty line
      }

      if (part.added) {
        originalLines.push("");
        newLines.push(
          <span key={key} className="bg-green-300 dark:bg-green-700">
            {lines[i]}
          </span>
        );
      } else if (part.removed) {
        originalLines.push(
          <span key={key} className="bg-red-300 dark:bg-red-700">
            {lines[i]}
          </span>
        );
        newLines.push("");
      } else {
        /* if (changesOnly) continue; */
        originalLines.push(<span key={key}>{lines[i]}</span>);
        key += 1;
        newLines.push(<span key={key}>{lines[i]}</span>);
      }

      if (i < lines.length - 1) {
        key += 1;
        originalLines.push(<br key={key} />);
        key += 1;
        newLines.push(<br key={key} />);
      }
    }
  });

  return { originalLines, newLines };
}
