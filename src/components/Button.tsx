import React from "react";
import { ButtonSize } from "../Types";
export default function Button({
  children,
  onClick = () => {},
  className = "",
  disabled = false,
  rounded = false,
  size = "medium",
  style = "primary",
  buttonType = "button",
}: {
  size?: ButtonSize;
  children: string;
  onClick?: any;
  className?: string;
  disabled?: boolean;
  rounded?: boolean;
  style?: "primary" | "secondary";
  buttonType?: "button" | "submit";
}) {
  let colors =
    "bg-button hover:bg-buttonhover text-buttontext hover:text-buttonhovertext dark:bg-dmbutton dark:hover:bg-dmbuttonhover dark:text-dmtext dark:hover:text-dmbuttonhovertext";

  if (style === "secondary") {
    colors =
      "bg-button hover:bg-buttonhover text-buttontext hover:text-buttonhovertext dark:bg-dmbuttonsecondary dark:hover:bg-dmbuttonhoversecondary dark:text-dmtextsecondary dark:hover:text-dmbuttonhovertextsecondary border border-dmbackground";
  }

  const sizes = {
    small: " py-1 px-2 text-sm",
    medium: " py-2 px-3 text-sm",
    large: "py-3 px-4 text-base",
  };

  const sizeCss = sizes[size];

  const rounds = {
    small: "rounded-md",
    medium: "rounded-md",
    large: "rounded-lg",
  };

  const roundedCss = rounded ? rounds[size] : "";

  return (
    <button
      type={buttonType}
      disabled={disabled}
      className={`shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${colors} ${sizeCss} ${roundedCss} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
