import React from "react";
import { marked } from "marked";
import * as DOMPurify from "dompurify";

export default function MarkdownBlock({ text }: { text: string }) {
  let html = marked.parse(text);

  html = DOMPurify.sanitize(html);

  return (
    <div
      className="typography markdown"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
