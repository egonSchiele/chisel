import React from "react";

import { forwardRef } from "react";

const Input = forwardRef<any, any>(function Input(
  {
    name,
    value,
    onChange,
    rounded = true,
    title = null,
    className = "",
    divClassName = "mt-xs mb-sm",
    inputClassName = "",
    labelClassName = "",
    placeholder = "",
    onBlur = null,
    onKeyDown = null,
    selector = "",
    icon = null,
    type = "text",
  },
  ref
) {
  const roundedCss = rounded ? "rounded-md" : "";
  return (
    <div className={className}>
      {title && (
        <label htmlFor={name} className={`settings_label ${labelClassName}`}>
          {title}
        </label>
      )}
      {icon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          {icon}
        </div>
      )}

      <div className={`${divClassName}`}>
        {type === "text" && (
          <input
            type="input"
            ref={ref}
            name={name}
            id={name}
            value={value || ""}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            onKeyDown={onKeyDown}
            className={`block w-full py-1 px-2 text-text shadow-sm border dark:border-gray-700 dark:bg-black dark:text-dmtext sm:text-sm sm:leading-6 focus:border-blue-800 ${roundedCss} ${inputClassName}`}
            data-selector={selector}
          />
        )}
        {type === "password" && (
          <input
            type="password"
            ref={ref}
            name={name}
            id={name}
            value={value || ""}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            onKeyDown={onKeyDown}
            autoComplete="new-password"
            className={`block w-full py-1 px-2 text-text shadow-sm border dark:border-gray-700 dark:bg-black dark:text-dmtext sm:text-sm sm:leading-6 focus:border-blue-800 ${roundedCss} ${inputClassName}`}
            data-selector={selector}
          />
        )}
      </div>
    </div>
  );
});

export default Input;
