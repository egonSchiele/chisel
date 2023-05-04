import React from "react";
export default function Tag({ letter, className = "" }) {
  return (
    <div
      className={`m-0 p-0 mt-xs mr-xs text-center uppercase text-xs rounded border text-gray-500 border-gray-500 ${className}`}
    >
      {letter}
    </div>
  );
}
