import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import React from "react";
type Direction = "left" | "right";
function Nav({ close, direction }) {
  return (
    <div className="flex pb-sm">
      {direction === "left" && <div className="flex flex-grow" />}
      <div className="flex-none">
        <button
          type="button"
          className="relative rounded-md inline-flex items-center bg-white pl-0 pr-3 py-2 text-gray-400  hover:bg-gray-50 ring-0"
          onClick={close}
        >
          <span className="sr-only">Close</span>
          {direction === "left" && (
            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
          )}
          {direction === "right" && (
            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>
      {direction === "right" && <div className="flex flex-grow" />}
    </div>
  );
}

export default function List({
  title,
  items,
  className = "",
  close = null,
  direction = "left",
}: {
  title: string;
  items: any[];
  className?: string;
  close?: () => void | null;
  direction?: Direction;
}) {
  if (close) {
    return (
      <div
        className={`pt-sm px-sm border-r border-slate-300  h-full ${className} `}
      >
        <Nav close={close} direction={direction} />
        <h2 className="text-3xl font-semibold pb-md">{title}</h2>
        <ul>{items}</ul>
      </div>
    );
  }

  return (
    <div
      className={`pt-xl px-sm border-r border-slate-300  h-full ${className} `}
    >
      <h2 className="text-3xl font-semibold pb-md">{title}</h2>
      <ul>{items}</ul>
    </div>
  );
}
