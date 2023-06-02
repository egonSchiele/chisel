import React from "react";
import { useColors } from "../lib/hooks";

export default function NavButton({
  label,
  onClick,
  children,
  className = "",
  selector = "",
  selected = false,
}) {
  const colors = useColors();
  const animCss =
    "transition ease-in-out hover:scale-125 duration-100 active:scale-75 hover:dark:text-white";
  const selectedCss = selected
    ? `${colors.selectedBackground} ${colors.selectedTextColor}`
    : `${colors.background} ${colors.secondaryTextColor}`;

  return (
    <button
      type="button"
      className={`relative my-auto inline-flex items-center h-full px-xs py-1 rounded-none hover:bg-gray-50 ring-0 dark:hover:bg-dmsidebar ${animCss} ${className} ${selectedCss}`}
      onClick={onClick}
      data-selector={selector}
      title={label}
    >
      <span className="sr-only">{label}</span>
      {children}
    </button>
  );
}
