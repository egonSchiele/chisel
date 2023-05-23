import React from "react";

export default function NavButton({
  label,
  onClick,
  children,
  className = "",
  selector = "",
  selected = false,
}) {
  const animCss =
    "transition ease-in-out hover:scale-125 duration-100 active:scale-75 hover:dark:text-white";
  const selectedCss = selected
    ? "bg-gray-700 dark:bg-gray-500"
    : "text-black dark:text-gray-200";
  return (
    <button
      type="button"
      className={`relative my-auto inline-flex items-center h-full px-xs py-1 rounded-none hover:bg-gray-50 ring-0 dark:hover:bg-dmsidebar ${animCss} ${className} ${selectedCss}`}
      onClick={onClick}
      data-selector={selector}
    >
      <span className="sr-only">{label}</span>
      {children}
    </button>
  );
}
