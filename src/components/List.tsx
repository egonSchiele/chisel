import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "@heroicons/react/24/outline";
import * as t from "../Types";
import React from "react";
type Direction = "left" | "right";
function Nav({ close, direction, loading }) {
  return (
    <div className="flex pb-sm">
      {direction === "left" && <div className="flex flex-grow" />}
      <div className="flex-none">

        <button
          type="button"
          className="relative rounded-md inline-flex items-center bg-white dark:bg-dmsidebar dark:hover:bg-dmsidebarSecondary pl-0 pr-3 py-2 text-gray-400  hover:bg-gray-50 ring-0"
          onClick={close}
        >
          <span className="sr-only">New</span>

          <PlusIcon className="h-5 w-5" aria-hidden="true" />

        </button>
      </div>
      <div className="flex-none">
        <button
          type="button"
          className="relative rounded-md inline-flex items-center bg-white dark:bg-dmsidebar dark:hover:bg-dmsidebarSecondary pl-0 pr-3 py-2 text-gray-400  hover:bg-gray-50 ring-0"
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
      {loading && <Spinner />}
    </div>
  );
}


function MenuItem({ label, icon, onClick, className = "" }: { label: string, icon: any, onClick: () => void, className?: string }) {
  return <button
    type="button"
    className={`relative rounded-md inline-flex items-center text-gray-400  hover:bg-gray-50 ring-0 ${className}`}
    onClick={onClick}
  >
    <span className="sr-only">{label}</span>
    {icon}
  </button>
}

export default function List({
  title,
  items,
  className = "",
  leftMenuItem = null,
  rightMenuItem = null,
  level = 1,
  /* close = null,
  direction = "left", */
  /* loading = false, */
}: {
  title: string;
  items: any[];
  className?: string;
  leftMenuItem?: t.MenuItem | null;
  rightMenuItem?: t.MenuItem | null;
  level?: number;
  /* close?: () => void | null;
  direction?: Direction;
  loading?: boolean; */
}) {
  /*   if (close || loading) {
      return (
        <div
          className={`pt-sm px-sm border-r border-listBorder dark:border-dmlistBorder  h-full ${className} `}
        >
          <Nav close={close} direction={direction} loading={loading} />
          <h2 className="text-2xl font-semibold pb-xs">{title}</h2>
          <ul className="pt-xs">{items}</ul>
        </div>
      );
    }
   */
  return (
    <div
      className={`p-xs border-r border-listBorder dark:border-dmlistBorder h-full w-full ${className} `}
    >
      <div className="w-full flex pb-xs border-b border-listBorder dark:border-dmlistBorder">
        {leftMenuItem && <MenuItem {...leftMenuItem} />}
        {level === 1 && <div className="flex-grow items-center text-center">
          <h3 className="text-sm uppercase font-semibold">{title}</h3>
        </div>}
        {level === 2 && <div className="flex-grow">
          <h3 className="text-sm font-normal">{title}</h3>
        </div>}
        {rightMenuItem && <MenuItem {...rightMenuItem} />}
      </div>
      <ul className="pt-xs">{items}</ul>
    </div>
  );
}
