import React from "react";
export default function Header({ children, className = "" }) {
  return (
    <h4
      className={`text-xl font-semibold text-black dark:text-gray-300 mb-xs ${className}`}
    >
      {children}
    </h4>
  );
}
