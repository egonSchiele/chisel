import * as t from "./Types";
import React from "react";
import List from "./components/List";
function ChapterItem({ chapter }: { chapter: t.Chapter }) {
  return (
    <div className="py-xs border-b border-slate-300">
      <a href={`/chapter/${chapter.chapterid}`}>{chapter.title}</a>
    </div>
  );
}

export default function ChapterList({ chapters }: { chapters: t.Chapter[] }) {
  const items = chapters.map((chapter, index) => (
    <li key={chapter.chapterid}>
      <ChapterItem chapter={chapter} />
    </li>
  ));
  return <List title="Chapters" items={items} />;
}
