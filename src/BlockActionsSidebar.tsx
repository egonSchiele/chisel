import {
  ArrowsUpDownIcon,
  Bars3Icon,
  BarsArrowDownIcon,
  BarsArrowUpIcon,
  DocumentDuplicateIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import React, { useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import LibraryContext from "./LibraryContext";
import * as t from "./Types";
import Button from "./components/Button";
import List from "./components/List";
import {
  getSelectedBook,
  getSelectedChapter,
  getText,
  librarySlice,
} from "./reducers/librarySlice";
import { RootState } from "./store";

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

  items.push({
    label: "Diff with block below",
    onClick: () => {
      dispatch(librarySlice.actions.setViewMode("diff"));
    },
    icon: <DocumentDuplicateIcon className="h-4 w-4" aria-hidden="true" />,
  });

  items.push({
    label: "Delete block",
    onClick: () => {
      dispatch(librarySlice.actions.deleteBlock(index));
    },
    icon: <XMarkIcon className="h-4 w-4" aria-hidden="true" />,
  });

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
    <div className="grid grid-cols-1">
      <label className="settings_label mt-sm">Actions</label>
      {listItems.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </div>
  );
}
