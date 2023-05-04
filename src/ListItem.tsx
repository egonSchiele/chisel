import React from "react";
import { Link } from "react-router-dom";
import { BoltIcon, XMarkIcon } from "@heroicons/react/24/outline";
import * as t from "./Types";
import ListMenu from "./ListMenu";

export default function ListItem({
  link,
  title,
  selected,
  onFavorite,
  onDelete,
  onRename,
  onMove = null,
  onExport = null,
  content = "",
  selector = "listitem",
  tag = null,
}: {
  link: string;
  title: string;
  selected: boolean;
  onFavorite: () => void;
  onDelete: () => void;
  onRename: () => void;
  onMove?: () => void;
  onExport?: () => void;
  content?: string;
  selector?: string;
  tag?: string;
}) {
  const selectedCss = selected
    ? "bg-listitemhover dark:bg-dmlistitemhover"
    : "";
  const listMenuItems: t.MenuItem[] = [
    {
      label: "Delete",
      onClick: onDelete,
    },
    {
      label: "Rename",
      onClick: onRename,
    },
  ];
  if (onMove) {
    listMenuItems.push({
      label: "Move",
      onClick: onMove,
    });
  }
  if (onExport) {
    listMenuItems.push({
      label: "Export",
      onClick: onExport,
    });
  }
  return (
    <div
      className={`flex text-black w-full dark:text-slate-300 text-sm xl:text-md items-center rounded-md hover:bg-listitemhover hover:dark:bg-dmlistitemhover ${selectedCss} ${
        content && "border-b border-gray-300 dark:border-gray-700"
      }`}
    >
      <Link
        to={link}
        className="flex flex-grow items-center overflow-hidden py-xs mr-xs"
        data-selector={`${selector}-list-item-link`}
      >
        {!content && (
          <div className="w-full">
            <p
              className="px-xs overflow-hidden text-ellipsis whitespace-nowrap flex content-start"
              data-selector={`${selector}-list-item`}
            >
              {tag === "compost" && (
                <BoltIcon className="w-5 h-5 flex-grow mr-xs" />
              )}{" "}
              <span className="flex-grow w-full">{title}</span>
            </p>
          </div>
        )}
        {content && (
          <div className="w-full py-xs">
            <p
              className="px-xs overflow-hidden text-ellipsis whitespace-nowrap font-bold"
              data-selector={`${selector}-list-item`}
            >
              {title}
            </p>
            <p className="px-xs text-gray-500 dark:text-gray-400 line-clamp-2 text-ellipsis">
              {content}
            </p>
          </div>
        )}
      </Link>
      {tag !== "compost" && (
        <div className="flex flex-none cursor-pointer items-center mr-xs">
          <ListMenu
            items={listMenuItems}
            selector={selector}
            className="-translate-x-3/4"
          />
        </div>
      )}
    </div>
  );
}
