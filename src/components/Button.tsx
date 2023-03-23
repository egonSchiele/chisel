import React from "react";
export default function Button({ children, onClick, className = "" }) {
  return (
    <button
      type="button"
      className={
        "rounded-mm bg-main py-2 px-3 text-sm  text-white shadow-sm hover:bg-highlight hover:text-hover rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 " +
        className
      }
      onClick={onClick}
    >
      {children}
    </button>
  );
}
