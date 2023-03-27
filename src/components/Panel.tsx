import React from "react";
import { BeakerIcon, TrashIcon } from "@heroicons/react/24/solid";

export default function Panel({
  title,
  children,
  onClick = () => {},
  onDelete = null,
  className = "",
}) {
  return (
    <div
      className={`divide-y divide-gray-500 overflow-hidden bg-panel-background hover:bg-panel-background-hover dark:bg-dmpanel-background dark:hover:bg-dmpanel-background-hover shadow ${className}`}
    >
      <div className="px-2 py-2 sm:px-2 relative">
        <p>{title}</p>{" "}
        {onDelete && (
          <TrashIcon
            className="w-6 m-2 absolute top-0 right-0"
            onClick={onDelete}
          />
        )}
      </div>
      <div className="px-2 py-2 sm:p-2" onClick={onClick}>
        {children}
      </div>
    </div>
  );
}
