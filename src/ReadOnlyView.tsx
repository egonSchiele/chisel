import React from "react";
import * as t from "./Types";
import CodeBlock from "./components/CodeBlock";
import MarkdownBlock from "./components/MarkdownBlock";
import { Link } from "react-router-dom";
export default function ReadOnlyView({ textBlocks, fontClass }) {
  return textBlocks.map((text: t.TextBlock, index) => {
    if (text.type === "code") {
      return (
        <CodeBlock text={text.text} language={text.language} key={index} />
      );
    } else if (text.type === "markdown") {
      return (
        <MarkdownBlock text={text.text} key={index} className={fontClass} />
      );
    } else if (text.type === "embeddedText") {
      return (
        <pre key={index} className={`w-full typography ${fontClass}`}>
          Embedded
          <Link to={`/book/${text.bookid}/chapter/${text.chapterid}`}>
            {text.bookid}/{text.chapterid}
          </Link>
        </pre>
      );
    } else {
      return (
        <pre key={index} className={`w-full typography ${fontClass}`}>
          {text.text}
        </pre>
      );
    }
  });
}
