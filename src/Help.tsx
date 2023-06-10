/* import levenshtein from "js-levenshtein";
import intersection from "lodash/intersection";
 */ import sortBy from "lodash/sortBy";
import { apStyleTitleCase } from "ap-style-title-case";
import React, { Fragment, useState, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { Combobox, Dialog, Transition } from "@headlessui/react";
import { MenuItem } from "./Types";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Help({}: {}) {
  return (
    <Transition.Root show={true} as={Fragment} appear>
      <Dialog as="div" className="relative z-10" onClose={() => {}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto max-w-xl transform divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden rounded-xl bg-white dark:bg-black shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
              <div className="p-md">
                <h1 className="text-2xl font-bold mb-sm">Help</h1>
                <p className="text-gray-500">Keyboard shortcuts:</p>
                <ul className="list-disc list-inside text-gray-800 dark:text-gray-300 mb-sm">
                  <li>Command+Shift+P: Open command palette</li>
                  <li>Command+Shift+O: Open file navigator</li>
                </ul>
                <a href="https://egonschiele.github.io/chisel-docs/docs/introduction">
                  Docs
                </a>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
