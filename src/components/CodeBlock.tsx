import React from "react";
import SyntaxHighlighter from "../languages";
import zenburn from "react-syntax-highlighter/dist/esm/styles/hljs/zenburn";

export default function CodeBlock({
  text,
  language,
}: {
  text: string;
  language: string;
}) {
  const fixedText = text.trim().replaceAll("  ", "\t");

  return (
    <div className="my-sm">
      <div className="relative text-xs xl:text-sm text-gray-600 dark:text-gray-300 font-light uppercase mb-xs">
        {language}
      </div>
      <SyntaxHighlighter
        language={language}
        style={zenburn}
        showLineNumbers={true}
        wrapLines={true}
      >
        {fixedText}
      </SyntaxHighlighter>
    </div>
  );
}
