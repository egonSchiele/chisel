import React from "react";
import { RadioGroup as HeadlessRadioGroup } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/outline";
import { useColors } from "../lib/hooks";

export default function RadioGroup({
  value,
  onChange,
  label,
  options,
  className = "",
}) {
  const colors = useColors();
  function getStyle(checked) {
    let styles = ` w-full p-xs my-1 rounded-md border border-gray-300 dark:border-gray-700 text-sm cursor-pointer flex `;
    if (checked) {
      styles += colors.buttonBackgroundColor;
    } else {
      styles += colors.buttonBackgroundColorSecondary;
    }
    return styles;
  }
  function option(type, label) {
    return (
      <HeadlessRadioGroup.Option key={type} value={type}>
        {({ checked }) => (
          <div className={getStyle(checked)}>
            <span className="flex-grow">{label}</span>
            {checked && (
              <div className="shrink-0 text-white">
                <CheckIcon className="h-5 w-5" />
              </div>
            )}
          </div>
        )}
      </HeadlessRadioGroup.Option>
    );
  }

  return (
    <HeadlessRadioGroup
      value={value}
      onChange={onChange}
      className={"grid grid-cols-1"}
    >
      <HeadlessRadioGroup.Label className="settings_label">
        {label}
      </HeadlessRadioGroup.Label>
      {options.map((opt) => option(opt.type, opt.label))}
    </HeadlessRadioGroup>
  );
}
