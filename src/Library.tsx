import React, { Fragment, useState } from "react";
/* import { Dialog, Disclosure, Popover, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  ChartPieIcon,
  CursorArrowRaysIcon,
  FingerPrintIcon,
  SquaresPlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  ChevronDownIcon,
  PhoneIcon,
  PlayCircleIcon,
  RectangleGroupIcon,
} from "@heroicons/react/20/solid"; */

export default function Library() {
  return (
    <header className="relative isolate z-10 bg-white">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <form
            className="flex w-full lg:max-w-md"
            action="/api/newBook"
            method="POST"
          >
            <button
              type="submit"
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              New Book... <span aria-hidden="true">&rarr;</span>
            </button>
          </form>
        </div>
      </nav>
    </header>
  );
}
