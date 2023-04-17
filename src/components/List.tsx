import React from "react";
import * as t from "../Types";

// Top left and top right menu items
function MenuItem({
  label,
  icon,
  onClick,
  className = "",
}: {
  label: string;
  icon?: any;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`relative rounded-md inline-flex items-center text-black dark:text-gray-400  hover:bg-gray-50 ring-0 ${className}`}
      onClick={onClick}
      data-label={label}
    >
      <span className="sr-only">{label}</span>
      {icon}
    </button>
  );
}

export default function List({
  title,
  items,
  className = "",
  leftMenuItem = null,
  rightMenuItem = null,
  level = 1,
  onDrop = (e) => {},
}: {
  title: string;
  items: any[];
  className?: string;
  leftMenuItem?: t.MenuItem[] | t.MenuItem | null;
  rightMenuItem?: t.MenuItem | null;
  level?: number;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
}) {
  const [dragOver, setDragOver] = React.useState(false);
  return (
    <div
      className={`p-xs border-r border-listBorder dark:border-dmlistBorder h-full w-full ${className} ${
        dragOver && "dark:bg-gray-700"
      } `}
      onDragOver={(e) => {
        e.stopPropagation();
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        e.stopPropagation();
        e.preventDefault();
        setDragOver(false);
      }}
      onDrop={(e) => {
        setDragOver(false);
        onDrop(e);
      }}
    >
      <div className="w-full flex pb-xs border-b border-listBorder dark:border-dmlistBorder">
        {leftMenuItem &&
          Array.isArray(leftMenuItem) &&
          leftMenuItem.map((item, index) => <MenuItem key={index} {...item} />)}
        {leftMenuItem && !Array.isArray(leftMenuItem) && (
          <MenuItem {...leftMenuItem} />
        )}
        {level === 1 && (
          <div className="flex-grow items-center text-center">
            <h3 className="text-sm uppercase font-semibold">{title}</h3>
          </div>
        )}
        {level === 2 && (
          <div className="flex-grow">
            <h3 className="text-sm font-normal">{title}</h3>
          </div>
        )}
        {rightMenuItem && <MenuItem {...rightMenuItem} />}
      </div>
      <ul className="pt-xs" data-title={title}>
        {items}
      </ul>
    </div>
  );
}
