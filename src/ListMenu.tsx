import React, { Fragment } from "react";
import { Popover, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { EllipsisHorizontalIcon, HeartIcon } from "@heroicons/react/24/outline";
import { MenuItem } from "./Types";

export default function ListMenu({
  items,
  label = "Menu",
  selector = "menu",
}: {
  items: MenuItem[];
  label?: string;
  selector?: string;
}) {
  return (
    <Popover className="relative flex">
      <Popover.Button
        className="inline-flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900"
        data-selector={selector}
      >
        <span className="sr-only">{label}</span>
        <EllipsisHorizontalIcon className="w-4 h-4 text-slate-400" />
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
        <Popover.Panel className="absolute left-1/2 z-10 mt-5 flex w-screen max-w-min -translate-x-1/2 px-4">
          <div className="rounded-md bg-menu dark:bg-dmmenu p-xs text-sm text-black dark:text-gray-300 gap-1 shadow-2xl ring-1 ring-black ring-opacity-5">
            {items.map((item, index) => (
              <div
                key={index}
                className="px-sm py-xs rounded-md hover:bg-listitemhoverSecondary dark:hover:bg-gray-700 dark:hover:bg-dmlistitemhoverSecondary flex"
                onClick={item.onClick}
              >
                <div className=" mt-0">
                  {item.icon}
                  {' '}
                </div>
                <div className="ml-1 flex-grow whitespace-nowrap">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}
