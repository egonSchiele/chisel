import React from "react";
import { Link } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import * as t from "./Types";
import ListMenu from "./ListMenu";

export default function ListItem({
  link,
  title,
  selected,
  onFavorite,
  onDelete,
  onRename,
  content = "",
  selector = "listitem"
}: {
  link: string;
  title: string;
  selected: boolean;
  onFavorite: () => void;
  onDelete: () => void;
  onRename: () => void;
  content?: string;
  selector?: string;
}) {
  const selectedCss = selected
    ? "bg-listitemhover dark:bg-dmlistitemhover"
    : "";
  const listMenuItems: t.MenuItem[] = [
    {
      label: "Delete",
      onClick: onDelete
    },
    {
      label: "Rename",
      onClick: onRename
    }
  ];
  return (
    <div
      className={`flex text-black dark:text-slate-300 text-sm xl:text-md items-center rounded-md hover:bg-listitemhover hover:dark:bg-dmlistitemhover ${selectedCss} ${
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
              className="px-xs overflow-hidden text-ellipsis whitespace-nowrap"
              data-selector={`${selector}-list-item`}
            >
              {title}
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
      <div className="flex flex-none cursor-pointer items-center mr-xs">
        <ListMenu items={listMenuItems} selector={selector} />
      </div>
    </div>
  );
}
