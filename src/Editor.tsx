import React from "react";
import "./globals.css";
import { useSelector } from "react-redux";
import TextEditor from "./TextEditor";
import { RootState } from "./store";
import { getSelectedChapter, librarySlice } from "./reducers/librarySlice";
import { postWithCsrf } from "./fetchData";

export default function Editor() {
  const state = useSelector((state: RootState) => state.library);
  const currentChapter = useSelector(getSelectedChapter);

  if (!currentChapter) {
    return <div className="flex w-full h-full">Loading</div>;
  }

  console.log(currentChapter, "!!");

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
            />
          ))}
        </div>
      </div>
    </div>
  );
}
