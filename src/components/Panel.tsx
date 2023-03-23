import React from "react";
export default function Panel({
  title,
  children,
  onClick = () => {},
  className = "",
}) {
  return (
    <div
      className={`divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mb-sm ${className}`}
      onClick={onClick}
    >
      <div className="px-2 py-2 sm:px-2 bg-gray-100">{title}</div>
      <div className="px-2 py-2 sm:p-2 bg-gray-200">{children}</div>
    </div>
  );
}
