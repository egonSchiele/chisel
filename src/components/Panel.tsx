import React from "react";
export default function Panel({
  title,
  children,
  onClick = () => {},
  className = "",
}) {
  return (
    <div
      className={`shadow-sm border-gray-100 p-sm border-2 ${className}`}
      onClick={onClick}
    >
      <h1 className="text-md uppercase font-semibold text-gray-900">{title}</h1>
      {children}
    </div>
  );
}
