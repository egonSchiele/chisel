import { useContext, useEffect } from "react";
import LibraryContext from "../LibraryContext";
import * as t from "../Types";

export const useKeyboardScroll = (htmlRef, speed = 400, callback = null) => {
  const handleKeyDown = async (event) => {
    if (!htmlRef.current) return;
    const div = htmlRef.current;
    const curScroll = div.scrollTop;
    let newScroll = curScroll;
    if (event.shiftKey && event.code === "Space") {
      event.preventDefault();
      newScroll = div.scrollTop + speed * 2;
    } else if (event.code === "Space") {
      event.preventDefault();
      newScroll = div.scrollTop + speed;
    } else if (event.metaKey && event.code === "ArrowDown") {
      event.preventDefault();
      newScroll = div.scrollHeight;
    } else if (event.metaKey && event.code === "ArrowUp") {
      event.preventDefault();
      newScroll = 0;
    } else if (event.code === "ArrowDown") {
      event.preventDefault();
      newScroll = div.scrollTop + speed / 2;
    } else if (event.code === "ArrowUp") {
      event.preventDefault();
      newScroll = div.scrollTop - speed / 2;
    }
    if (newScroll !== curScroll) {
      div.scroll({ top: newScroll, behavior: "smooth" });
      console.log(newScroll, "<<");
      if (callback) {
        callback(newScroll);
      }
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, htmlRef]);
};

export function useKeyDown(callback) {
  useEffect(() => {
    document.addEventListener("keydown", callback);

    return () => {
      document.removeEventListener("keydown", callback);
    };
  }, [callback]);
}

export function useColors() {
  const { settings } = useContext(LibraryContext) as t.LibraryContextType;

  const theme = settings?.theme || "default";
  if (theme === "dark" || theme === "default") {
    return darkColors();
  } else {
    return lightColors();
  }
}
export function darkColors() {
  let background = " bg-dmSidebarSecondary";
  let backgroundHover = " hover:bg-gray-600";
  let backgroundAlt = "bg-dmSidebar hover:bg-gray-600";
  let selectedBackground = "bg-gray-700 hover:bg-gray-500";
  let borderColor = "border-gray-500";
  let selectedBorderColor = "border-gray-500";
  let primaryTextColor = " text-gray-200";
  let secondaryTextColor = " text-gray-400";
  let secondaryTextColorSelected = " text-gray-300";
  let selectedTextColor = " text-gray-200";
  let highlightTextColor = " text-blue-400";
  let itemHover = " hover:bg-gray-600";
  let buttonBackgroundColor = " bg-blue-700 hover:bg-blue-500";
  let buttonTextColor = " text-gray-200";
  let buttonBackgroundColorSecondary = " bg-dmbutton hover:bg-dmbuttonhover";
  let buttonTextColorSecondary = " text-dmtext hover:text-dmbuttonhovertext";
  return {
    background,
    backgroundHover,
    backgroundAlt,
    selectedBackground,
    borderColor,
    selectedBorderColor,
    primaryTextColor,
    secondaryTextColor,
    secondaryTextColorSelected,
    selectedTextColor,
    highlightTextColor,
    itemHover,
    buttonBackgroundColor,
    buttonTextColor,
    buttonBackgroundColorSecondary,
    buttonTextColorSecondary,
  };
}
export function lightColors() {
  let background = "bg-gray-100";
  let backgroundHover = "hover:bg-gray-200";
  let backgroundAlt = "bg-gray-50 hover:bg-gray-100";
  let selectedBackground = "bg-gray-300";
  let borderColor = "border-gray-100";
  let selectedBorderColor = "border-gray-300";
  let primaryTextColor = "text-gray-900";
  let secondaryTextColor = "text-gray-500";
  let secondaryTextColorSelected = "text-gray-600";
  let selectedTextColor = "text-gray-900";
  let highlightTextColor = "text-blue-700";
  let itemHover = "hover:bg-gray-200";
  let buttonBackgroundColor = "bg-blue-400 hover:bg-blue-600";
  let buttonTextColor = "text-gray-900 hover:text-white";
  let buttonBackgroundColorSecondary = "bg-gray-300 hover:bg-gray-400";
  let buttonTextColorSecondary = "text-gray-800 hover:text-white";
  return {
    background,
    backgroundHover,
    backgroundAlt,
    selectedBackground,
    borderColor,
    selectedBorderColor,
    primaryTextColor,
    secondaryTextColor,
    secondaryTextColorSelected,
    selectedTextColor,
    highlightTextColor,
    itemHover,
    buttonBackgroundColor,
    buttonTextColor,
    buttonBackgroundColorSecondary,
    buttonTextColorSecondary,
  };
}
