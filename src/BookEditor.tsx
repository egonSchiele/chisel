import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store";
import React from "react";
import { getSelectedBook, librarySlice } from "./reducers/librarySlice";
import ContentEditable from "./components/ContentEditable";
import TextArea from "./components/TextArea";

export default function BookEditor() {
  const book = useSelector(getSelectedBook);
  const dispatch = useDispatch();
  if (!book) {
    return <div>loading</div>;
  }
  return (
    <div className="flex h-screen overflow-scroll w-full">
      <div className="mx-auto px-sm lg:px-md mt-0 mb-md h-full w-full">
        <ContentEditable
          value={book.title}
          className="text-2xl mb-sm tracking-wide font-semibold text-darkest dark:text-lightest"
          onSubmit={(title) => {
            dispatch(librarySlice.actions.setBookTitle(title));
          }}
          nextFocus={() => {}}
          selector="book-editor-title"
        />
        <TextArea
          name="synopsis"
          value={book.synopsis || ""}
          onChange={(e) => {
            dispatch(librarySlice.actions.setBookSynopsis(e.target.value));
          }}
          title="Synopsis"
        />
      </div>
    </div>
  );
}
