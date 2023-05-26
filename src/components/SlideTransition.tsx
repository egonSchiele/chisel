import { Transition } from "@headlessui/react";
import React from "react";

export default function SlideTransition({ show, direction, children }) {
  let enterFrom = "opacity-0 translate-x-full";
  let enterTo = "translate-x-0 opacity-100";

  if (direction === "left") {
    enterFrom = "opacity-0 -translate-x-full";
    enterTo = "translate-x-0 opacity-100";
  }
  return (
    <Transition
      show={show}
      /* enter="transition-opacity duration-75"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-150"
      leaveFrom="opacity-100"
      leaveTo="opacity-0" */
      enter="transition ease-in-out duration-150 transform"
      enterFrom={enterFrom}
      enterTo={enterTo}
      leave="transition ease-in-out duration-150 transform"
      leaveFrom={enterTo}
      leaveTo={enterFrom}
    >
      {children}
    </Transition>
  );
}
