import React from "react";
export default function Button({
  children,
  onClick,
  className = "",
  disabled = false,
}) {
  const bgColor = disabled
    ? "bg-gray-300 hover:bg-gray-300 text-gray-900 hover:text-gray-900"
    : "bg-main hover:bg-highlight text-white hover:text-hover";

  return (
    <button
      type="button"
      disabled={disabled}
      className={`rounded-mm py-2 px-3 text-sm  shadow-sm rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${bgColor} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
