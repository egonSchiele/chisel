import React from "react";
export default function Button({ children, onClick, className = "" }) {
  return (
    <button
      type="button"
      className={
        "rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 " +
        className
      }
      onClick={onClick}
    >
      {children}
    </button>
  );
}
