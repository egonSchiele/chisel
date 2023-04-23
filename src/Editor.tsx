import React from "react";
import "./globals.css";
import { useDispatch, useSelector } from "react-redux";
import TextEditor from "./TextEditor";
import * as t from "./Types";
import { getCsrfToken } from "./utils";
import { RootState } from "./store";
import { getSelectedChapter, librarySlice } from "./reducers/librarySlice";
import { postWithCsrf } from "./fetchData";

export default function Editor({
  onSave,
}: {
  onSave: (state: t.State) => void;
}) {
  const state = useSelector((state: RootState) => state.library);
  const dispatch = useDispatch();
  const currentChapter = useSelector(getSelectedChapter);

  console.log(currentChapter.text, "!!");
  return (
    <div className="flex w-full h-full">
      <div className="w-full h-full col-span-4">
        <div className="h-0 pb-1 w-full flex">
          <div className="flex flex-none" />
          <div className="flex flex-grow" />
        </div>
        <div className="h-full w-full">
          {currentChapter.text.map((textBlock, index) => (
            <TextEditor
              chapterid={currentChapter.chapterid}
              index={index}
              key={index}
              saved={state.saved}
              onSave={() => onSave(state)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
