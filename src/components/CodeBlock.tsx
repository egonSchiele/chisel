import React from "react";
import SyntaxHighlighter from "../lib/languages";
import vs2015 from "react-syntax-highlighter/dist/esm/styles/hljs/vs2015";

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
        style={vs2015}
        /* showLineNumbers={true} */
        wrapLines={true}
      >
        {fixedText}
      </SyntaxHighlighter>
    </div>
  );
}
