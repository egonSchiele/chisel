import React from "react";

export default function NavButton({
  label,
  onClick,
  children,
  className = "",
}) {
  return (
    <button
      type="button"
      className={`relative inline-flex items-center px-1 text-black dark:text-gray-400  hover:bg-gray-50 ring-0 dark:bg-dmsidebarSecondary dark:hover:bg-dmsidebar ${className}`}
      onClick={onClick}
    >
      <span className="sr-only">{label}</span>
      {children}
    </button>
  );
}
