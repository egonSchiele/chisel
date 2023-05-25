import { RadioGroup } from "@headlessui/react";
import React, { useContext, useState } from "react";
import {
  ArrowDownLeftIcon,
  Bars3Icon,
  CheckIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from "react-redux";
import ButtonGroup from "./components/ButtonGroup";
import Button from "./components/Button";
import * as t from "./Types";
import * as fd from "./lib/fetchData";
import List from "./components/List";
import Spinner from "./components/Spinner";
import { fetchSuggestionsWrapper } from "./utils";
import { RootState } from "./store";
import {
  getSelectedBook,
  getSelectedChapter,
  getText,
  librarySlice,
} from "./reducers/librarySlice";
import LibraryContext from "./LibraryContext";
import ListItem from "./components/ListItem";
import Switch from "./components/Switch";

import { languages } from "./lib/languages";
import Select from "./components/Select";
import Input from "./components/Input";

import BlockInfoSidebar from "./BlockInfoSidebar";
import { Tab } from "@headlessui/react";
import { useState } from "react";
import { Tab } from "@headlessui/react";
import BlockActionsSidebar from "./BlockActionsSidebar";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function BlockSidebar() {
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
      <Tab.Group>
        <Tab.List className="flex border-r border-gray-700">
          <Tab className={getClassNames}>
            <InformationCircleIcon className="w-5 h-5 mx-auto text-gray-200" />
          </Tab>
          <Tab className={getClassNames}>
            <Bars3Icon className="w-5 h-5 mx-auto text-gray-200" />
          </Tab>
        </Tab.List>
        <Tab.Panels className="">
          <Tab.Panel>
            <BlockInfoSidebar />
          </Tab.Panel>
          <Tab.Panel>
            <BlockActionsSidebar />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
