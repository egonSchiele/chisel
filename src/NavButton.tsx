import React from "react";

export default function NavButton({
  label,
  onClick,
  children,
  className = "",
  selector = "",
}) {
  const animCss =
    "transition ease-in-out hover:scale-125 duration-100 active:scale-75 hover:dark:text-white";

  return (
    <button
      type="button"
      className={`relative inline-flex items-center px-1 text-black dark:text-gray-400 rounded-md hover:bg-gray-50 ring-0 dark:hover:bg-dmsidebar ${animCss} ${className}`}
      onClick={onClick}
      data-selector={selector}
    >
      <span className="sr-only">{label}</span>
      {children}
    </button>
  );
}
