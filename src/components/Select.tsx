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
        className="block text-sm font-light leading-6 text-gray-500"
      >
        {title}
      </label>
      <select
        id={name}
        name={name}
        className={`mt-0 block w-full rounded-md border-0 py-1 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 ${className}`}
        value={value}
        onChange={onChange}
      >
        {children}
      </select>
    </div>
  );
}
