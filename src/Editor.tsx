import React from "react";
import "./globals.css";
import TextEditor from "./TextEditor";
import * as t from "./Types";
import { getCsrfToken } from "./utils";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store";
import { librarySlice } from "./reducers/librarySlice";

export default function Editor({
  onSave,
}: {
  onSave: (state: t.State) => void;
}) {
  const state = useSelector((state: RootState) => state.library);
  const dispatch = useDispatch();
  async function saveChapter(state: t.State) {
    if (state.saved) return;
    if (!state.chapter) {
      console.log("no chapter");
      return;
    }

    const chapter = { ...state.chapter };
    chapter.suggestions = state.suggestions;
    const body = JSON.stringify({ chapter, csrfToken: getCsrfToken() });

    const result = await fetch("/api/saveChapter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    if (!result.ok) {
      dispatch(librarySlice.actions.setError(result.statusText));
    } else {
      dispatch(librarySlice.actions.clearError());
      dispatch(librarySlice.actions.setSaved(true));
    }
  }

  const editorColSpan = "col-span-4";
  /*
  if (sidebarOpen && promptsOpen) {
    editorColSpan = "col-span-2";
  } else if (sidebarOpen || promptsOpen) {
    editorColSpan = "col-span-3";
  } */

  return (
    <div className="flex w-full h-full">
      <div className={`w-full h-full ${editorColSpan}`}>
        <div className="h-0 pb-1 w-full flex">
          <div className="flex flex-none" />
          <div className="flex flex-grow" />
        </div>
        <div className="h-full w-full">
          <TextEditor
            chapterid={state.chapter.chapterid}
            saved={state.saved}
            onSave={() => onSave(state)}
          />
        </div>
      </div>
    </div>
  );
}
