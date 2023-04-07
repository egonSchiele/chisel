import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "@heroicons/react/24/outline";
import * as t from "../Types";
import React from "react";

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
  leftMenuItem?: t.MenuItem[] | t.MenuItem | null;
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
        {leftMenuItem && Array.isArray(leftMenuItem) && leftMenuItem.map((item, index) => <MenuItem key={index} {...item} />) }
        {leftMenuItem && !Array.isArray(leftMenuItem) && <MenuItem {...leftMenuItem} />}
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
