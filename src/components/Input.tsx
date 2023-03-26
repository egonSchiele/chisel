import React from "react";
export default function Input({
  name,
  value,
  onChange,
  title = null,
  ref = null,
  className = "",
  onBlur = null,
  onKeyDown = null,
}) {
  return (
    <div className={className}>
      {title && (
        <label
          htmlFor={name}
          className="block text-sm font-light leading-6 text-gray-500"
        >
          {title}
        </label>
      )}
      <div className="mt-0">
        <input
          type="input"
          ref={ref}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          className="block w-full rounded-md border-0 py-1 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        />
      </div>
    </div>
  );
}
