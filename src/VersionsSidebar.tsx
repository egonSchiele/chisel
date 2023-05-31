import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { EditorState } from "./Types";
import Button from "./components/Button";
import List from "./components/List";
import ListItem from "./components/ListItem";
import sortBy from "lodash/sortBy";

import {
  getSelectedBook,
  getSelectedChapter,
  librarySlice,
} from "./reducers/librarySlice";
import { RootState } from "./store";

export default function VersionsSidebar() {
  const state: EditorState = useSelector(
    (state: RootState) => state.library.editor
  );
  const currentBook = useSelector(getSelectedBook);
  const index = state.activeTextIndex;
  const currentChapter = useSelector(getSelectedChapter);
  const currentText = currentChapter.text[index];
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const items = [];

  if (currentText.type === "embeddedText") {
    items.push(<p key="err">Embedded text blocks cannot have versions</p>);
  } else {
    const versions = [{ text: currentText.text, id: null }];
    if (currentText.versions) {
      versions.push(...currentText.versions);
    }
    sortBy(versions, ["text"]).forEach((version, i) => {
      const title = version.text.split("\n")[0].substring(0, 20);
      items.push(
        <ListItem
          key={i}
          title={title}
          selected={version.id === null}
          onClick={() => {
            if (version.id !== null) {
              dispatch(
                librarySlice.actions.switchVersion({
                  index,
                  versionid: version.id,
                })
              );
            }
          }}
        />
      );
    });

    items.push(
      <Button
        key="new version"
        onClick={() =>
          dispatch(
            librarySlice.actions.addVersion({
              index,
            })
          )
        }
        style="secondary"
        className="w-full my-sm"
      >
        Add New Version
      </Button>
    );
  }
  return (
    <List
      title="Versions"
      items={items}
      leftMenuItem={null}
      rightMenuItem={null}
      className="bg-sidebarSecondary dark:bg-dmsidebarSecondary border-r border-b border-gray-700 w-48"
      selector="versionsList"
    />
  );
}
