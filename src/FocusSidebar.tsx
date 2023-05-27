import {
  Bars3Icon,
  BeakerIcon,
  BugAntIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { getText } from "./reducers/librarySlice";
import { RootState } from "./store";

import { Tab } from "@headlessui/react";
import BlockActionsSidebar from "./BlockActionsSidebar";
import BlockInfoSidebar from "./BlockInfoSidebar";
import OutlineSidebar from "./OutlineSidebar";
import FocusChecksSidebar from "./FocusChecksSidebar";
import SynonymsSidebar from "./SynonymsSidebar";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function FocusSidebar({ tabIndex = 1 }: { tabIndex?: number }) {
  const [selectedIndex, setSelectedIndex] = useState(tabIndex);

  const state = useSelector((state: RootState) => state.library.editor);
  const index = state.activeTextIndex;
  const currentText = useSelector(getText(index));

  if (!currentText) return null;
  function getClassNames({ selected }) {
    const defaultClasses = "w-full py-1 text-sm font-medium text-center";
    return classNames(
      defaultClasses,
      selected
        ? "bg-gray-700 hover:bg-gray-500"
        : "bg-dmSidebarSecondary hover:bg-gray-600"
    );
  }
  return (
    <div className="w-full px-0">
      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <Tab.List className="flex border-r border-gray-700">
          <Tab className={getClassNames}>
            <BugAntIcon className="w-5 h-5 mx-auto text-gray-200" />
          </Tab>
          <Tab className={getClassNames}>
            <BeakerIcon className="w-5 h-5 mx-auto text-gray-200" />
          </Tab>
        </Tab.List>
        <Tab.Panels className="">
          <Tab.Panel>
            <FocusChecksSidebar />
          </Tab.Panel>
          <Tab.Panel>
            <SynonymsSidebar />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
