import React from "react";
import { useColors } from "../lib/hooks";

export default function TextArea({
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
  rows = 4,
  selector = "",
}: {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rounded?: boolean;
  title?: string | null;
  ref?: React.RefObject<HTMLTextAreaElement> | null;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  placeholder?: string;
  onBlur?: ((e: React.FocusEvent<HTMLTextAreaElement>) => void) | null;
  onKeyDown?: ((e: React.KeyboardEvent<HTMLTextAreaElement>) => void) | null;
  rows?: number;
  selector?: string;
}) {
  const roundedCss = rounded ? "rounded-md" : "";
  const colors = useColors();
  return (
    <div className={className}>
      {title && (
        <label
          htmlFor={name}
          className={`block text-sm font-light leading-6 ${colors.primaryTextColor} uppercase ${labelClassName}`}
        >
          {title}
        </label>
      )}
      <div className="mt-xs mb-sm">
        <textarea
          ref={ref}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur as any}
          placeholder={placeholder}
          onKeyDown={onKeyDown as any}
          className={`block w-full py-1 px-2 shadow-sm border ${colors.borderColor} ${colors.primaryTextColor} dark:bg-black  sm:text-sm sm:leading-6 ${roundedCss} ${inputClassName}`}
          rows={rows}
          data-selector={selector}
        />
      </div>
    </div>
  );
}
