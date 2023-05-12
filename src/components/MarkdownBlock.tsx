import React from "react";
import { marked } from "marked";
import * as DOMPurify from "dompurify";
import CodeBlock from "./CodeBlock";
import ReactDOMServer from "react-dom/server";

const renderer = {
  code(code, infostring, escaped) {
    const element = <CodeBlock text={code} language={infostring} />;
    const htmlString = ReactDOMServer.renderToString(element);
    return htmlString;
  },
};
marked.use({ renderer });

export default function MarkdownBlock({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  let html = marked.parse(text);

  html = DOMPurify.sanitize(html);

  return (
    <div
      className={`typography markdown ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
