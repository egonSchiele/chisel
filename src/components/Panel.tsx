import React from "react";
import { BeakerIcon, TrashIcon } from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function Panel({
  title,
  children,
  onClick = () => {},
  onDelete = null,
  className = "",
}) {
  return (
    <div className="mb-md">
      <div className="p-xs relative text-xs xl:text-sm text-slate-600 dark:text-white font-light uppercase">
        <p>{title}</p>
        {onDelete && (
          <XMarkIcon
            className="w-4 m-2 absolute top-0 right-0 cursor-pointer"
            onClick={onDelete}
          />
        )}
      </div>

      <div
        className={`rounded-md bg-panel-background hover:bg-panel-background-hover dark:bg-dmpanel-background dark:hover:bg-dmpanel-background-hover ${className}`}
      >
        <div className="p-sm text-md leading-6 text-darkest dark:text-gray-300" onClick={onClick}>
          {children}
        </div>
      </div>
    </div>
  );
}
