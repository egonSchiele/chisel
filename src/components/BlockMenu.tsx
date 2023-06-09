import React, { Fragment } from "react";
import { Popover, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import {
  ArrowsUpDownIcon,
  Bars3BottomLeftIcon,
  BarsArrowDownIcon,
  BarsArrowUpIcon,
  CheckIcon,
  Cog6ToothIcon,
  EllipsisHorizontalIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { MenuItem, blockTypes } from "../Types";
import ListMenu from "./ListMenu";
import { useDispatch } from "react-redux";
import { librarySlice } from "../reducers/librarySlice";
export default function BlockMenu({ currentText, index }) {
  const dispatch = useDispatch();
  const items: MenuItem[] = [
    {
      label: "Merge Block Up",
      onClick: () => {
        dispatch(librarySlice.actions.mergeBlockUp(index));
      },
      icon: <BarsArrowUpIcon className="h-4 w-4" aria-hidden="true" />,
    },
    {
      label: "Merge Block Down",
      onClick: () => {
        dispatch(librarySlice.actions.mergeBlockDown(index));
      },
      icon: <BarsArrowDownIcon className="h-4 w-4" aria-hidden="true" />,
    },
    ,
    {
      label: "Merge With Surrounding Blocks",
      onClick: () => {
        dispatch(librarySlice.actions.mergeBlockSurrounding(index));
      },
      icon: <ArrowsUpDownIcon className="h-4 w-4" aria-hidden="true" />,
    },
    {
      label: "Add Caption",
      onClick: () => {
        dispatch(
          librarySlice.actions.showPopup({
            title: "Add Caption",
            inputValue: currentText.caption || "",
            onSubmit: (newCaption) =>
              dispatch(
                librarySlice.actions.addCaption({
                  index,
                  caption: newCaption,
                })
              ),
          })
        );
      },
      icon: <Bars3BottomLeftIcon className="h-4 w-4" aria-hidden="true" />,
    },
  ];

  blockTypes.forEach(
    (blockType) => {
      let icon = <div className="w-5 h-5" aria-hidden="true" />;
      if (currentText.type === blockType) {
        icon = (
          <CheckIcon className="w-5 h-5 text-gray-500" aria-hidden="true" />
        );
        // <WrenchIcon className="h-4 w-4" aria-hidden="true" />,
      }
      items.push({
        label: blockType,
        onClick: () => {
          dispatch(
            librarySlice.actions.setBlockType({
              index,
              type: blockType,
            })
          );
        },
        icon,
      });
    },
    {
      label: "Add New Version",
      onClick: () => {
        dispatch(librarySlice.actions.addVersion({ index }));
      },
    }
  );

  let icon = <div className="w-5 h-5" aria-hidden="true" />;
  if (currentText.reference) {
    icon = <CheckIcon className="w-5 h-5 text-gray-500" aria-hidden="true" />;
    // <WrenchIcon className="h-4 w-4" aria-hidden="true" />,
  }
  items.push({
    label: "reference",
    onClick: () => {
      dispatch(librarySlice.actions.toggleReference(index));
    },
    icon,
  });

  return (
    <ListMenu
      items={items}
      //icon={<Cog6ToothIcon className="w-5 h-5 text-gray-500" />}
      buttonClassName="w-5 h-5 dark:text-gray-500"
    />
  );
}
