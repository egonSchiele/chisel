import React, { Fragment } from "react";
import { Popover, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import {
  CheckIcon,
  Cog6ToothIcon,
  EllipsisHorizontalIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { MenuItem, blockTypes } from "./Types";
import ListMenu from "./ListMenu";
import { useDispatch } from "react-redux";
import { librarySlice } from "./reducers/librarySlice";
export default function BlockMenu({ currentText, index }) {
  const dispatch = useDispatch();
  const items: MenuItem[] = [];

  blockTypes.forEach((blockType) => {
    let icon = <div className="w-5 h-5" aria-hidden="true" />;
    if (currentText.type === blockType) {
      icon = <CheckIcon className="w-5 h-5 text-gray-500" aria-hidden="true" />;
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
  });

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

  return <ListMenu items={items} buttonClassName="!text-gray-500 w-5 h-5" />;
}
