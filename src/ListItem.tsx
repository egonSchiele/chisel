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
    const selectedCss = selected ? "bg-listitemhover dark:bg-dmlistitemhover" : "";
    return (
      <div
        className={`flex py-xs text-slate-300 text-sm xl:text-md items-center rounded-md ${selectedCss}`}
      >
        <div className="flex flex-grow items-center overflow-hidden text-ellipsis whitespace-nowrap mr-xs">
          <Link to={link}>
            <div className="px-xs">{title}</div>
          </Link>
        </div>
        <div
          className="flex flex-none cursor-pointer items-center mr-xs"
        >
          <ListMenu onFavorite={onFavorite} onDelete={onDelete} />
          
        </div>
      </div>
    );
  }
  