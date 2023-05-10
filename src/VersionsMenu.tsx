import React, { Fragment } from "react";
import { Popover, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import {
  Bars3Icon,
  BarsArrowDownIcon,
  BarsArrowUpIcon,
  CheckIcon,
  Cog6ToothIcon,
  EllipsisHorizontalIcon,
  HeartIcon,
  Square2StackIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { MenuItem, blockTypes } from "./Types";
import ListMenu from "./ListMenu";
import { useDispatch } from "react-redux";
import { librarySlice } from "./reducers/librarySlice";
import { hasVersions } from "./utils";
export default function VersionsMenu({ currentText, index }) {
  const dispatch = useDispatch();
  const items: MenuItem[] = [];

  if (!hasVersions(currentText)) {
    return null;
  }
  currentText.versions.forEach((version) => {
    const icon = (
      <Bars3Icon className="w-5 h-5 text-gray-500" aria-hidden="true" />
    );

    items.push({
      label: `${version.title} - ${new Date(
        version.createdAt
      ).toLocaleString()}`,
      onClick: () => {
        dispatch(
          librarySlice.actions.switchVersion({
            index,
            versionid: version.id,
          })
        );
      },
      icon,
    });
  });

  items.push({
    label: "Delete all versions",
    onClick: () => {
      dispatch(
        librarySlice.actions.deleteAllVersions({
          index,
        })
      );
    },
    icon: <XMarkIcon className="w-5 h-5 text-gray-500" aria-hidden="true" />,
  });

  return (
    <ListMenu
      items={items}
      icon={<Square2StackIcon className="w-5 h-5 text-gray-500" />}
      //buttonClassName="w-5 h-5 dark:text-gray-500"
    />
  );
}
