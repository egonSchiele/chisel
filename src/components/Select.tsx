import React from "react";

export default function Select({
  title,
  name,
  value,
  onChange,
  className = "",
  children,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-light leading-6 text-text dark:text-dmtext uppercase"
      >
        {title}
      </label>
      <select
        id={name}
        name={name}
        className={`mt-xs mb-sm block w-full rounded-md border-0 py-1 pl-3 pr-10 text-gray-900  dark:border-gray-700 dark:bg-black dark:text-dmtext ring-1 ring-inset ring-gray-300 dark:ring-gray-500 focus:ring-2  sm:text-sm sm:leading-6 ${className}`}
        value={value || ""}
        onChange={onChange}
      >
        {children}
      </select>
    </div>
  );
}
