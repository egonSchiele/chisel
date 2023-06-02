import {
  Bars3Icon,
  InformationCircleIcon,
  Square2StackIcon,
} from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { getText } from "./reducers/librarySlice";
import { RootState } from "./store";

import { Tab } from "@headlessui/react";
import BlockActionsSidebar from "./BlockActionsSidebar";
import BlockInfoSidebar from "./BlockInfoSidebar";
import OutlineSidebar from "./OutlineSidebar";
import VersionsSidebar from "./VersionsSidebar";
import { useColors } from "./lib/hooks";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function BlockSidebar({ tabIndex = 0 }: { tabIndex?: number }) {
  const [selectedIndex, setSelectedIndex] = useState(tabIndex);

  const state = useSelector((state: RootState) => state.library.editor);
  const index = state.activeTextIndex;
  const currentText = useSelector(getText(index));
  const colors = useColors();
  if (!currentText) return null;
  function getClassNames({ selected }) {
    const defaultClasses = "w-full py-1 text-sm font-medium text-center";
    return classNames(
      defaultClasses,
      selected
        ? "bg-gray-300 dark:bg-gray-700 hover:bg-gray-500 hover:text-white"
        : "bg-dmSidebarSecondary hover:bg-gray-600"
    );
  }
  return (
    <div className="w-full px-0">
      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <Tab.List className="flex border-r border-gray-700">
          <Tab className={getClassNames}>
            <InformationCircleIcon
              className={`w-5 h-5 mx-auto ${colors.secondaryTextColor}`}
            />
          </Tab>
          <Tab className={getClassNames}>
            <Square2StackIcon
              className={`w-5 h-5 mx-auto ${colors.secondaryTextColor}`}
            />
          </Tab>
        </Tab.List>
        <Tab.Panels className="">
          <Tab.Panel>
            <BlockInfoSidebar />
          </Tab.Panel>
          <Tab.Panel>
            <VersionsSidebar />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
