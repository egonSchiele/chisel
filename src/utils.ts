import { useRef, useEffect, useState } from "react";
import * as fd from "./fetchData";

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
// Hook
export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      return initialValue;
    }
  });
  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };
  return [storedValue, setValue] as const;
}

export const fetchSuggestionsWrapper = async (
  state,
  settings,
  setLoading,
  dispatch,
  onLoad,
  prompt,
  label,
) => {
  const max_tokens_with_min = Math.min(settings.max_tokens, 500);
  let { text } = state;
  if (
    state._cachedSelectedText
    && state._cachedSelectedText.contents
    && state._cachedSelectedText.contents.length > 0
  ) {
    text = state._cachedSelectedText.contents;
  }
  setLoading(true);
  const result = await fd.fetchSuggestions(
    text,
    settings.model,
    settings.num_suggestions,
    max_tokens_with_min,
    prompt,
    label,
  );
  setLoading(false);

  if (result.tag === "error") {
    dispatch({ type: "SET_ERROR", payload: result.message });
    return;
  }

  result.payload.forEach((choice) => {
    const generatedText = choice.text;
    dispatch({
      type: "ADD_SUGGESTION",
      label,
      payload: generatedText,
    });
  });
  dispatch({ type: "SET_SAVED", payload: false });

  onLoad();
};

export function split(text) {
  let parts = text.replaceAll("\n", "\n ").split(" ");
  parts = parts.filter((part) => part !== "");
  return parts;
}

export function normalize(word: string) {
  return word.toLowerCase().replace(/[^a-z ]/g, "");
}

export function findSubarray(array: any[], subarray: any[]) {
  const subarrayLength = subarray.length;
  for (let i = 0; i < array.length; i++) {
    if (array.slice(i, i + subarrayLength).join(" ") === subarray.join(" ")) {
      return i;
    }
  }
  return -1;
}

export function getCsrfToken() {
  const token = document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute("content");
  return token;
}
