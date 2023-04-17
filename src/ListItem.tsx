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
  selector = "listitem",
}: {
  link: string;
  title: string;
  selected: boolean;
  onFavorite: () => void;
  onDelete: () => void;
  onRename: () => void;
  selector?: string;
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
  return (
    <div
      className={`flex text-black dark:text-slate-300 text-sm xl:text-md items-center rounded-md hover:bg-listitemhover hover:dark:bg-dmlistitemhover ${selectedCss}`}
    >
      <Link
        to={link}
        className="flex flex-grow items-center overflow-hidden py-xs mr-xs"
      >
        <div className="w-full">
          <p
            className="px-xs overflow-hidden text-ellipsis whitespace-nowrap"
            data-selector={`${selector}-list-item`}
          >
            {title}
          </p>
        </div>
      </Link>
      <div className="flex flex-none cursor-pointer items-center mr-xs">
        <ListMenu items={listMenuItems} selector={selector} />
      </div>
    </div>
  );
}
