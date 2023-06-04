import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as t from "./Types";
import List from "./components/List";
import ListItem from "./components/ListItem";
import { useColors } from "./lib/hooks";
import {
  getSelectedBook,
  getSelectedChapter,
  librarySlice,
} from "./reducers/librarySlice";
import { RootState } from "./store";

export default function EditHistorySidebar() {
  const editHistory: t.EditHistory[] = useSelector(
    (state: RootState) => state.library.editHistory
  );
  const currentBook = useSelector(getSelectedBook);
  const currentChapter = useSelector(getSelectedChapter);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const colors = useColors();

  if (!currentChapter) return null;
  const items = editHistory.map((history, i) => {
    return (
      <ListItem
        title={`Undo ${history.label}`}
        key={history.id}
        className="w-full"
        selected={false}
        onClick={() => {
          dispatch(librarySlice.actions.restoreFromEditHistory(i));
        }}
      />
    );
  });

  return (
    <List
      title="Edit History"
      items={items}
      leftMenuItem={null}
      rightMenuItem={null}
      selector="editHistoryList"
    />
  );
}
