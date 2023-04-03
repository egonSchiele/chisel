import React from "react";
export default function List({
  title,
  items,
  className = "",
}: {
  title: string;
  items: any[];
  className?: string;
}) {
  return (
    <div
      className={`pt-xl px-sm border-r border-slate-300  h-full ${className} `}
    >
      <h2 className="text-3xl font-bold pb-md">{title}</h2>
      <ul>{items}</ul>
    </div>
  );
}
