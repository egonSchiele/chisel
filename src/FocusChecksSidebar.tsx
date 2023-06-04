import sortBy from "lodash/sortBy";

import { daleChall } from "dale-chall";
import { stemmer } from "stemmer";
import range from "lodash/range";
import { XMarkIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useRef, useState } from "react";
import { hedges } from "hedges";
import NavButton from "./components/NavButton";
import { fillers } from "fillers";
import cliches from "./lib/cliches";
import List from "./components/List";
import { syllable } from "syllable";
import Button from "./components/Button";
import jargon from "./jargon";
import { normalize, findSubarray, split } from "./utils";
import * as fd from "./lib/fetchData";
import { useKeyboardScroll } from "./lib/hooks";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store";
import { useNavigate } from "react-router-dom";
import {
  getSelectedBook,
  getSelectedChapter,
  librarySlice,
} from "./reducers/librarySlice";
import { EditorState } from "./Types";
import ListItem from "./components/ListItem";

export default function FocusSidebar() {
  const state: EditorState = useSelector(
    (state: RootState) => state.library.editor
  );
  const currentBook = useSelector(getSelectedBook);
  const index = state.activeTextIndex;
  const currentChapter = useSelector(getSelectedChapter);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const items = [
    <Button
      key="recheck"
      onClick={() => dispatch(librarySlice.actions.triggerFocusModeRerender())}
      style="secondary"
      className="w-full my-sm"
    >
      Recheck
    </Button>,
  ];
  const byIndex = (a) => a.range.index;
  if (state.focusModeChecks) {
    sortBy(state.focusModeChecks, byIndex).forEach((check, i) => {
      const content = check.content.substring(0, 20);
      items.push(
        <li key={i}>
          <ListItem
            title={`${check.name} (${content})`}
            selected={false}
            onClick={() => {
              dispatch(librarySlice.actions.setSelection(check.range));
            }}
            /* onMouseEnter={() => {
              dispatch(librarySlice.actions.setSelection(check.range));
            }}
            onMouseLeave={() => {
              dispatch(librarySlice.actions.clearPushSelectionToEditor());
            }} */
          />
        </li>
      );
    });
  }
  return (
    <List
      title="Issues"
      items={items}
      leftMenuItem={null}
      rightMenuItem={null}
      selector="focusModeList"
    />
  );
}
