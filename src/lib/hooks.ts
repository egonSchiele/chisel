import { useContext, useEffect } from "react";
import LibraryContext from "../LibraryContext";
import * as t from "../Types";
import { librarySlice } from "../reducers/librarySlice";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { useParams } from "react-router-dom";
import { decryptChapter, getCookie, setCookie } from "../utils";

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
    /*   } else if (theme === "solarized") {
    return solarizedColors();
 */
  } else {
    return lightColors();
  }
}
export function darkColors() {
  let background = " dark:bg-black";
  let backgroundHover = " dark:hover:bg-gray-600";
  let backgroundAlt = "dark:bg-dmSidebar hover:dark:bg-gray-600";
  let selectedBackground = "dark:bg-gray-700 hover:dark:bg-gray-500";
  let borderColor = "dark:border-gray-800";
  let selectedBorderColor = "dark:border-gray-600";
  let primaryTextColor = " dark:text-gray-200";
  let secondaryTextColor = " dark:text-gray-400";
  let secondaryTextColorSelected = " dark:text-gray-300";
  let selectedTextColor = " dark:text-gray-200";
  let highlightTextColor = " dark:text-blue-400";
  let itemHover = " hover:dark:bg-gray-600";
  let buttonBackgroundColor = " dark:bg-blue-700 dark:hover:bg-blue-500";
  let buttonTextColor = " dark:text-gray-200";
  let buttonBackgroundColorSecondary =
    " dark:bg-dmbutton dark:hover:bg-dmbuttonhover";
  let buttonTextColorSecondary =
    " dark:text-dmtext dark:hover:text-dmbuttonhovertext";
  let navBackgroundColor = " dark:bg-gray-700";
  let navBackgroundColorSelected = " dark:bg-gray-600";
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
    navBackgroundColor,
    navBackgroundColorSelected,
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
  let navBackgroundColor = " bg-gray-100";
  let navBackgroundColorSelected = " bg-gray-200";
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
    navBackgroundColor,
    navBackgroundColorSelected,
  };
}
/* export function solarizedColors() {
  let background = "bg-red-500";
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
 */

export function useSSEUpdates(encrypted) {
  const clientid = getCookie("clientid");
  const dispatch = useDispatch();
  const stored = JSON.parse(localStorage.getItem("encryptionPassword"));
  const password = stored?.password || null;

  function listen(eventName, eventSource, func) {
    eventSource.addEventListener(eventName, (e) => {
      console.warn("sse update:", eventName, e);

      const data = JSON.parse(e.data);
      func(data);
      setCookie("lastHeardFromServer", data.lastHeardFromServer, 14);
    });
  }

  return useEffect(() => {
    if (clientid) {
      const eventSourceUrl = `/api/sseUpdates`;
      const eventSource = new EventSource(eventSourceUrl, {
        withCredentials: true,
      });
      listen("chapterUpdate", eventSource, (data) => {
        let { chapter } = data;
        if (encrypted) {
          chapter = decryptChapter(chapter, password);
        }
        dispatch(librarySlice.actions.updateChapterSSE(chapter));
      });
      listen("bookUpdate", eventSource, (data) => {
        const { book } = data;
        dispatch(librarySlice.actions.updateBookSSE(book));
      });
      listen("chapterDelete", eventSource, (data) => {
        const { chapterid } = data;
        dispatch(librarySlice.actions.deleteChapter(chapterid));
      });
      listen("bookDelete", eventSource, (data) => {
        const { bookid } = data;
        dispatch(librarySlice.actions.deleteBook(bookid));
      });
      listen("chapterCreate", eventSource, (data) => {
        const { chapter, bookid } = data;
        dispatch(librarySlice.actions.newChapter({ chapter, bookid }));
      });
      listen("bookCreate", eventSource, (data) => {
        const { book } = data;
        dispatch(librarySlice.actions.newBook(book));
      });
      return () => {
        // console.log("closing event source");
        eventSource.close();
      };
    }
  }, [clientid, encrypted]);
}
