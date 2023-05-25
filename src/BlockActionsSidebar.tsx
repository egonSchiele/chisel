import { RadioGroup } from "@headlessui/react";
import React, { useContext, useState } from "react";
import {
  ArrowsUpDownIcon,
  Bars3Icon,
  BarsArrowDownIcon,
  BarsArrowUpIcon,
  CheckIcon,
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

export default function BlockActionsSidebar({}: {}) {
  const state = useSelector((state: RootState) => state.library.editor);
  const currentBook = useSelector(getSelectedBook);
  const index = state.activeTextIndex;
  const currentChapter = useSelector(getSelectedChapter);
  const currentText = useSelector(getText(index));
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { settings } = useContext(LibraryContext) as t.LibraryContextType;

  if (!currentText) return null;

  const listItems: any[] = [];
  const items: t.MenuItem[] = [];

  items.push({
    label: "New Block Before Current",
    onClick: () => {
      dispatch(librarySlice.actions.newBlockBeforeCurrent());
    },
    icon: <Bars3Icon className="h-4 w-4" aria-hidden="true" />,
  });

  items.push({
    label: "New Block After Current",
    onClick: () => {
      dispatch(librarySlice.actions.newBlockAfterCurrent());
    },
    icon: <Bars3Icon className="h-4 w-4" aria-hidden="true" />,
  });

  if (state.selectedText && state.selectedText.length > 0) {
    items.push({
      label: "Extract Block",
      onClick: () => {
        dispatch(librarySlice.actions.extractBlock());
      },
      icon: <Bars3Icon className="h-4 w-4" aria-hidden="true" />,
      tooltip: "Alt+Shift+Down",
    });
  }
  if (state.activeTextIndex !== 0) {
    items.push({
      label: "Merge Block Up",
      onClick: () => {
        dispatch(librarySlice.actions.mergeBlockUp());
      },
      icon: <BarsArrowUpIcon className="h-4 w-4" aria-hidden="true" />,
    });
  }
  if (state.activeTextIndex !== currentChapter!.text.length - 1) {
    items.push({
      label: "Merge Block Down",
      onClick: () => {
        dispatch(librarySlice.actions.mergeBlockDown());
      },
      icon: <BarsArrowDownIcon className="h-4 w-4" aria-hidden="true" />,
    });
  }
  if (
    state.activeTextIndex !== 0 &&
    state.activeTextIndex !== currentChapter!.text.length - 1
  ) {
    items.push({
      label: "Merge With Surrounding Blocks",
      onClick: () => {
        dispatch(librarySlice.actions.mergeBlockSurrounding());
      },
      icon: <ArrowsUpDownIcon className="h-4 w-4" aria-hidden="true" />,
    });
  }

  items.forEach((item) => {
    listItems.push(
      <Button
        size="medium"
        style="secondary"
        rounded={true}
        onClick={item.onClick}
        key={item.label}
        className="w-full my-xs flex"
      >
        {/* <span className="mr-xs">{item.icon}</span>  */}
        <p className="mx-auto">{item.label}</p>
      </Button>
    );
  });

  return (
    <List
      title="Block Actions"
      items={listItems}
      leftMenuItem={null}
      rightMenuItem={null}
      className="bg-sidebarSecondary dark:bg-dmsidebarSecondary border-r border-b border-gray-700"
      selector="blockActionsList"
    />
  );
}
