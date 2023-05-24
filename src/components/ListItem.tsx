import React from "react";
import { Link } from "react-router-dom";
import { BoltIcon, XMarkIcon } from "@heroicons/react/24/outline";
import * as t from "../Types";
import ListMenu from "./ListMenu";

export default function ListItem({
  link,
  title,
  selected,
  menuItems = [],
  content = "",
  selector = "listitem",
  tag = null,
  contentClassName = "",
}: {
  link: string;
  title: string;
  selected: boolean;
  menuItems?: t.MenuItem[];
  content?: string;
  selector?: string;
  tag?: string | null;
  contentClassName?: string;
}) {
  const selectedCss = selected ? "border-l-4 border-gray-500" : "";

  return (
    <div
      className={`flex text-black w-full dark:text-slate-300 text-sm xl:text-md items-center hover:bg-listitemhover hover:dark:bg-dmlistitemhover ${selectedCss}`}
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
              <span className="flex-grow w-full text-lg md:text-sm">
                {title}
              </span>
            </p>
          </div>
        )}
        {content && (
          <div className="w-full py-xs">
            <p
              className="px-xs overflow-hidden text-lg md:text-sm text-ellipsis whitespace-nowrap font-bold"
              data-selector={`${selector}-list-item`}
            >
              {title}
            </p>
            <p
              className={`px-xs text-gray-300 dark:text-gray-500 line-clamp-2 leading-4  text-ellipsis ${contentClassName}`}
            >
              {content}
            </p>
          </div>
        )}
      </Link>
      {tag !== "compost" && menuItems.length > 0 && (
        <div className="flex flex-none cursor-pointer items-center mr-xs">
          <ListMenu
            items={menuItems}
            selector={selector}
            className="-translate-x-3/4"
          />
        </div>
      )}
    </div>
  );
}
