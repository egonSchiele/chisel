import React from "react";
export default function Input({
  name,
  value,
  onChange,
  rounded = true,
  title = null,
  ref = null,
  className = "",
  inputClassName = "",
  placeholder = "",
  onBlur = null,
  onKeyDown = null,
}) {
  const roundedCss = rounded ? "rounded-md" : "";
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
          placeholder={placeholder}
          onKeyDown={onKeyDown}
          className={`block w-full py-1 px-2 text-gray-900 shadow-sm border border-gray-200 sm:text-sm sm:leading-6 ${roundedCss} ${inputClassName}`}
        />
      </div>
    </div>
  );
}
