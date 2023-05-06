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
      <span className="sr-only">{label}</span>
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
  level = 1,
  onDrop = (e) => {},
  selector = "list",
  swipeToClose = null,
  close = null,
  open = null,
}: {
  title: string;
  items: any[];
  className?: string;
  leftMenuItem?: t.MenuItem[] | t.MenuItem | null;
  rightMenuItem?: t.MenuItem | null;
  level?: number;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  selector?: string;
  swipeToClose?: "left" | "right" | null;
  close?: () => void;
  open?: () => void;
}) {
  const [dragOver, setDragOver] = React.useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    let touchstartX = 0;
    let touchendX = 0;

    function checkDirection() {
      if (touchendX < touchstartX) {
        if (swipeToClose === "left" && close) {
          close();
        }
      }
      if (touchendX > touchstartX) {
        if (swipeToClose === "right" && close) {
          close();
        } else if (swipeToClose === "left" && open) {
          open();
        }
      }
    }

    function handleStart(e) {
      touchstartX = e.changedTouches[0].screenX;
    }

    function handleEnd(e) {
      touchendX = e.changedTouches[0].screenX;
      checkDirection();
    }

    document.addEventListener("touchstart", handleStart);

    document.addEventListener("touchend", handleEnd);
    return () => {
      document.removeEventListener("touchstart", handleStart);
      document.removeEventListener("touchend", handleEnd);
    };
  }, []);

  return (
    <div
      className={`p-xs border-r border-listBorder dark:border-dmlistBorder h-screen overflow-y-auto overflow-x-hidden w-full ${className} ${
        dragOver && "dark:bg-gray-700"
      } `}
      onDragOver={(e) => {
        e.stopPropagation();
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        e.stopPropagation();
        e.preventDefault();
        setDragOver(false);
      }}
      onDrop={(e) => {
        setDragOver(false);
        onDrop(e);
      }}
      data-selector={`${selector}-list`}
    >
      <div className="w-full flex pb-xs border-b border-listBorder dark:border-dmlistBorder relative">
        {leftMenuItem &&
          Array.isArray(leftMenuItem) &&
          leftMenuItem.map((item, index) => (
            <MenuItem key={item.label} {...item} />
          ))}
        {leftMenuItem && !Array.isArray(leftMenuItem) && (
          <MenuItem {...leftMenuItem} />
        )}
        {level === 1 && (
          <div className="flex-grow items-center text-center absolute m-auto left-0 right-0">
            <h3 className="text-sm uppercase font-semibold">{title}</h3>
          </div>
        )}
        {level === 2 && (
          <div className="flex-grow">
            <h3 className="text-sm font-normal">{title}</h3>
          </div>
        )}
        {rightMenuItem && <MenuItem {...rightMenuItem} />}
      </div>
      <ul className="pt-xs" data-title={title}>
        {items}
      </ul>
    </div>
  );
}
