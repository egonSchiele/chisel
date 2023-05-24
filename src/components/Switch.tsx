import React, { useState } from "react";
import { Switch as HeadlessSwitch } from "@headlessui/react";

export default function Switch({ label, enabled, setEnabled, className = "" }) {
  return (
    <div className="">
      <label className="settings_label my-xs">{label}</label>
      <HeadlessSwitch
        checked={enabled}
        onChange={setEnabled}
        className={`${
          enabled
            ? "dark:bg-blue-500 bg-blue-500"
            : "bg-gray-200 dark:bg-gray-700"
        }
          relative inline-flex h-[38px] w-[74px] shrink-0 cursor-pointer border-2 border-transparent rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
      >
        <span
          aria-hidden="true"
          className={`${enabled ? "translate-x-9" : "translate-x-0"}
            pointer-events-none inline-block h-[34px] w-[34px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
        />
      </HeadlessSwitch>
    </div>
  );
}
