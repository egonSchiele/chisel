import React, { useEffect } from "react";
import * as t from "../Types";
import { useDispatch } from "react-redux";
import { librarySlice } from "../reducers/librarySlice";
import Spinner from "./Spinner";
// Top left and top right menu items
function MenuItem({
  label,
  icon,
  onClick,
  className = "",
  showSpinner = false,
  animate = false,
}: {
  label: string;
  icon?: any;
  onClick: () => void;
  className?: string;
  showSpinner?: boolean;
  animate?: boolean;
}) {
  const [_icon, setIcon] = React.useState(icon);
  const animCss = animate
    ? "transition ease-in-out hover:scale-125 duration-100 active:scale-75 hover:dark:text-white"
    : "hover:dark:text-white";
  return (
    <div
      className={`relative rounded-md inline-flex items-center text-black dark:text-gray-400  hover:bg-gray-50 cursor-pointer ring-0 ${animCss} ${className}`}
      onClick={async () => {
        if (showSpinner) {
          setIcon(<Spinner className="w-5 h-5" />);
        }
        await onClick();
        if (showSpinner) {
          setIcon(icon);
        }
      }}
      data-label={label}
    >
      <span className="sr-only ">{label}</span>
      {_icon}
    </div>
  );
}

export default function List({
  title,
  items,
  className = "",
  leftMenuItem = null,
  rightMenuItem = null,
  selector = "list",
  close = null,
  open = null,
  onTitleClick = null,
}: {
  title: string;
  items: any[];
  className?: string;
  leftMenuItem?: t.MenuItem[] | t.MenuItem | null;
  rightMenuItem?: t.MenuItem | null;
  selector?: string;
  close?: (() => void) | null;
  open?: (() => void) | null;
  onTitleClick?: (() => void) | null;
}) {
  return (
    <div
      className={`p-xs h-screen no-scrollbar dark:[color-scheme:dark] overflow-y-auto overflow-x-hidden w-full ${className} `}
      data-selector={`${selector}-list`}
    >
      <div className="w-full flex pb-sm md:pb-xs border-b border-listBorder dark:border-dmlistBorder relative">
        {
          <div className="flex-grow items-center text-center absolute m-auto left-0 right-0">
            <h3
              className="text-md md:text-sm uppercase font-semibold text-gray-700 dark:text-gray-300"
              // @ts-ignore
              onClick={onTitleClick}
            >
              {title}
            </h3>
          </div>
        }

        {leftMenuItem &&
          Array.isArray(leftMenuItem) &&
          leftMenuItem.map((item, index) => (
            <MenuItem key={item.label} {...item} />
          ))}
        {leftMenuItem && !Array.isArray(leftMenuItem) && (
          <MenuItem {...leftMenuItem} />
        )}

        {rightMenuItem && (
          <div className=" absolute mr-xs right-0">
            <MenuItem {...rightMenuItem} />
          </div>
        )}
      </div>
      <ul className="pt-xs pb-lg" data-title={title}>
        {items}
      </ul>
    </div>
  );
}
