import { useEffect } from "react";

export const useKeyboardScroll = (htmlRef, speed=400) => {
    const handleKeyDown = async (event) => {
    if (!htmlRef.current) return;
    const div = htmlRef.current;
    if (event.shiftKey && event.code === "Space") {
      event.preventDefault();
      div.scroll({ top: div.scrollTop + (speed*2), behavior: "smooth" });
    } else if (event.code === "Space") {
      event.preventDefault();
      div.scroll({ top: div.scrollTop + speed, behavior: "smooth" });
    } else if (event.metaKey && event.code === "ArrowDown") {
      event.preventDefault();
      div.scroll({ top: div.scrollHeight, behavior: "smooth" });
    } else if (event.metaKey && event.code === "ArrowUp") {
      event.preventDefault();
      div.scroll({ top: 0, behavior: "smooth" });
    } else if (event.code === "ArrowDown") {
      event.preventDefault();
      div.scroll({ top: div.scrollTop + speed, behavior: "smooth" });
    } else if (event.code === "ArrowUp") {
      event.preventDefault();
      div.scroll({ top: div.scrollTop - speed, behavior: "smooth" });
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, htmlRef]);
}