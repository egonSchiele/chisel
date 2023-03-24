import { useRef, useEffect } from "react";

export function useInterval(fn, delay) {
  const saved = useRef();
  useEffect(() => {
    saved.current = fn;
  }, [fn]);

  useEffect(() => {
    function tick() {
      if (saved && saved.current) {
        // @ts-ignore
        saved.current();
      }
    }
    const interval = setInterval(() => {
      tick();
    }, delay);
    return () => {
      clearInterval(interval);
    };
  }, [delay]);
}
