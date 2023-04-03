import * as t from "./Types";
import React from "react";
import List from "./components/List";
import { Link } from "react-router-dom";
function ChapterItem({ chapter }: { chapter: t.Chapter }) {
  return (
    <Link to={`/chapter/${chapter.chapterid}`}>
      <div className="py-xs border-b border-slate-300">{chapter.title}</div>
    </Link>
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
