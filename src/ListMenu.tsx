import React, { Fragment } from "react";
import { Popover, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { EllipsisHorizontalIcon, HeartIcon } from "@heroicons/react/24/outline";
import { MenuItem } from "./Types";
import { apStyleTitleCase } from "ap-style-title-case";
export default function ListMenu({
  items,
  label = "Menu",
  selector = "menu",
  className = "",
  buttonClassName = "",
  icon = null,
}: {
  items: MenuItem[];
  label?: string;
  selector?: string;
  className?: string;
  buttonClassName?: string;
  icon?: React.ReactNode;
}) {
  const animCss =
    "transition ease-in-out hover:scale-125 duration-100 active:scale-75 hover:dark:text-white";

  return (
    <Popover className="relative flex">
      <Popover.Button
        className={`inline-flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900 rounded-md ${animCss}`}
        data-selector={`${selector}-list-item-menu-button`}
      >
        <span className="sr-only">{label}</span>
        {!icon && (
          <EllipsisHorizontalIcon
            className={`w-4 h-4 text-slate-400 ${buttonClassName}`}
          />
        )}
        {icon && icon}
      </Popover.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel
          className={`absolute left-1/2 z-10 mt-5 flex w-screen max-w-min px-4 ${className}`}
        >
          <div className="rounded-md bg-menu dark:bg-dmmenu p-xs text-sm text-black dark:text-gray-300 gap-1 shadow-2xl ring-1 ring-black ring-opacity-5">
            {items.map((item, index) => (
              <div
                key={index}
                className={`px-sm py-xs rounded-md hover:bg-listitemhoverSecondary  dark:hover:bg-dmlistitemhoverSecondary flex cursor-pointer `}
                onClick={item.onClick}
                data-selector={`${selector}-list-item-button-${item.label}`}
              >
                <div className={`mt-0 `}>{item.icon} </div>
                <div className="ml-1 flex-grow whitespace-nowrap">
                  {apStyleTitleCase(item.label)}
                </div>
              </div>
            ))}
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}
