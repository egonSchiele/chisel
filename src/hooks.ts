import { useEffect } from "react";

export const useKeyboardScroll = (htmlRef, speed=400, callback=null) => {
    const handleKeyDown = async (event) => {
    if (!htmlRef.current) return;
    const div = htmlRef.current;
    const curScroll = div.scrollTop;
    let newScroll = curScroll;
    if (event.shiftKey && event.code === "Space") {
      event.preventDefault();
      newScroll = div.scrollTop + (speed*2);
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
      newScroll = div.scrollTop + (speed/2);
    } else if (event.code === "ArrowUp") {
      event.preventDefault();
      newScroll = div.scrollTop - (speed/2);
    }
    if (newScroll !== curScroll) {
      div.scroll({ top: newScroll, behavior: "smooth" });
      console.log(newScroll, "<<")
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
}