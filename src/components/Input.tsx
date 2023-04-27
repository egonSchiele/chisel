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
  labelClassName = "",
  placeholder = "",
  onBlur = null,
  onKeyDown = null,
  selector = "",
  icon = null,
}) {
  const roundedCss = rounded ? "rounded-md" : "";
  return (
    <div className={className}>
      {title && (
        <label
          htmlFor={name}
          className={`block text-sm font-light leading-6 text-text dark:text-dmtext uppercase ${labelClassName}`}
        >
          {title}
        </label>
      )}
      {icon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          {icon}
        </div>
      )}
      <div className="mt-xs mb-sm">
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
          className={`block w-full py-1 px-2 text-text shadow-sm border dark:border-gray-700 dark:bg-black dark:text-dmtext sm:text-sm sm:leading-6 ${roundedCss} ${inputClassName}`}
          data-selector={selector}
        />
      </div>
    </div>
  );
}
