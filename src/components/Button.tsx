import React from "react";
import { ButtonSize } from "../Types";
export default function Button({
  children,
  onClick = () => {},
  className = "",
  disabled = false,
  size = "medium",
  buttonType = "button",
}: {
  size?: ButtonSize;
  children: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  buttonType?: "button" | "submit";
}) {
  const colors = disabled
    ? "bg-gray-300 hover:bg-gray-300 text-gray-900 hover:text-gray-900"
    : "bg-button hover:bg-buttonhover text-buttontext hover:text-buttonhovertext dark:bg-dmbutton dark:hover:bg-dmbuttonhover dark:text-dmtext dark:hover:text-dmbuttonhovertext";

  const sizes = {
    small: " py-1 px-2 text-sm",
    medium: " py-2 px-3 text-sm",
    large: "py-3 px-4 text-base",
  };

  const sizeCss = sizes[size];

  return (
    <button
      type={buttonType}
      disabled={disabled}
      className={`shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${colors} ${sizeCss} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
