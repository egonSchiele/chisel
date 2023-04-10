import React from "react";
import * as t from "./Types";
import { Link } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import ListMenu from "./ListMenu";
export function ListItem({
  link,
  title,
  selected,
  onFavorite,
  onDelete,
}: {
  link: string;
  title: string;
  selected: boolean;
  onFavorite: () => void;
  onDelete: () => void;
}) {
  const selectedCss = selected
    ? "bg-listitemhover dark:bg-dmlistitemhover"
    : "";
  return (
    <div
      className={`flex py-xs text-black dark:text-slate-300 text-sm xl:text-md items-center rounded-md ${selectedCss}`}
    >
      <Link
        to={link}
        className="flex flex-grow items-center overflow-hidden text-ellipsis whitespace-nowrap mr-xs"
      >
        <div className="">
          <div className="px-xs">{title}</div>
        </div>
      </Link>
      <div className="flex flex-none cursor-pointer items-center mr-xs">
        <ListMenu onFavorite={onFavorite} onDelete={onDelete} />
      </div>
    </div>
  );
}
