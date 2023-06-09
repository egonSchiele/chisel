import React from "react";
import { ButtonSize } from "../Types";
import { useColors } from "../lib/hooks";

export default function Button({
  children,
  onClick = () => {},
  className = "",
  disabled = false,
  rounded = true,
  size = "medium",
  style = "primary",
  selector = "",
  plausibleEventName = "",
}: {
  size?: ButtonSize;
  children: any;
  onClick?: any;
  className?: string;
  disabled?: boolean;
  rounded?: boolean;
  style?: "primary" | "secondary";
  selector?: string;
  plausibleEventName?: string;
}) {
  const globalColors = useColors();

  let colors = `border border-gray-300 dark:border-gray-700 ${globalColors.buttonBackgroundColorSecondary} ${globalColors.buttonTextColorSecondary}`;

  if (style === "secondary") {
    colors = `${globalColors.buttonBackgroundColor} ${globalColors.buttonTextColor}`;
  }

  if (disabled) {
    colors = `bg-gray-500 ${globalColors.buttonTextColor}`;
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

  let _plausibleEventName = plausibleEventName;
  if (_plausibleEventName === "" && selector !== "") {
    _plausibleEventName = `button-click-${selector}`;
  }

  let plausibleEventCss = "";
  if (_plausibleEventName !== "") {
    plausibleEventCss = `plausible-event-name=${_plausibleEventName}`;
  }

  return (
    <button
      type="button"
      disabled={disabled}
      className={`shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${plausibleEventCss} ${colors} ${sizeCss} ${roundedCss} ${className}`}
      data-selector={selector}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
