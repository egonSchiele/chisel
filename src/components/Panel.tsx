import React from "react";
export default function Panel({
  title,
  children,
  onClick = () => {},
  className = "",
}) {
  return (
    <div
      className={`divide-y divide-gray-500 overflow-hidden bg-panel-background hover:bg-panel-background-hover dark:bg-dmpanel-background dark:hover:bg-dmpanel-background-hover shadow ${className}`}
      onClick={onClick}
    >
      <div className="px-2 py-2 sm:px-2">{title}</div>
      <div className="px-2 py-2 sm:p-2">{children}</div>
    </div>
  );
}
