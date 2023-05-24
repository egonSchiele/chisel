import React, { MouseEventHandler } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BoltIcon, XMarkIcon } from "@heroicons/react/24/outline";
import * as t from "../Types";
import ListMenu from "./ListMenu";

export default function ListItem({
  title,
  selected,
  link = null,
  menuItems = [],
  selector = "listitem",
  tag = null,
  content = "",
  contentClassName = "",
  onClick = null,
}: {
  title: string;
  selected: boolean;
  link?: string | null;
  menuItems?: t.MenuItem[];
  selector?: string;
  tag?: string | null;
  content?: string;
  contentClassName?: string;
  onClick?: MouseEventHandler<HTMLDivElement> | undefined | null;
}) {
  const navigate = useNavigate();
  let _onClick = onClick;
  if (link) {
    _onClick = () => {
      navigate(link);
    };
  }
  _onClick = _onClick || (() => {});
  const selectedCss = selected ? "border-l-4 border-gray-500" : "";
  return (
    <div
      className={`flex text-black w-full dark:text-slate-300 text-sm xl:text-md items-center hover:bg-listitemhover hover:dark:bg-dmlistitemhover ${selectedCss}`}
    >
      <div
        onClick={_onClick}
        className={`flex flex-grow items-center overflow-hidden py-xs mr-xs cursor-pointer`}
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
      </div>
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
