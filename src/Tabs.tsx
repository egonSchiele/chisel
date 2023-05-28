import * as t from "./Types";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { getSelectedChapter, getCompostBookId } from "./reducers/librarySlice";
import { RootState, AppDispatch } from "./store";
//import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@reach/tabs";

function Tab({ chapter }) {
  return (
    <div className="tab">
      <div className="tab-title">{chapter.title}</div>
    </div>
  );
}

export default function Tabs() {
  const state: t.State = useSelector((state: RootState) => state.library);
  const openTabs: string[] = useSelector(
    (state: RootState) => state.library.openTabs
  );
  const currentChapter = getSelectedChapter({ library: state });
  const compostBookId = useSelector(getCompostBookId);
  const editor = useSelector((state: RootState) => state.library.editor);
  const viewMode = useSelector((state: RootState) => state.library.viewMode);
  const currentText = currentChapter?.text || [];

  const dispatch = useDispatch<AppDispatch>();

  if (!currentChapter) return null;
  return (
    <div className="tabs absolute top-10 left-96">
      <Tab chapter={currentChapter} />
    </div>
  );
}
