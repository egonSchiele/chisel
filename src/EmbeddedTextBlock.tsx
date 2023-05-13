import React from "react";
import { useDispatch, useSelector } from "react-redux";
import * as t from "./Types";
import { RootState } from "./store";
import Select from "./components/Select";
import { librarySlice } from "./reducers/librarySlice";
import Launcher from "./Launcher";
import Button from "./components/Button";
import ReadOnlyView from "./ReadOnlyView";
import { Link } from "react-router-dom";

export default function EmbeddedTextBlock({
  chapterid,
  text,
  index,
}: {
  chapterid: string;
  text: t.EmbeddedTextBlock;
  index: number;
}) {
  const state: t.State = useSelector((state: RootState) => state.library);
  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(false);

  let chapter = null;
  let book = null;
  if (text.bookid) {
    book = state.books.find((book) => book.bookid === text.bookid);
    if (book) {
      chapter = book.chapters.find(
        (chapter) => chapter.chapterid === text.chapterid
      );
    }
  }

  const items = [];
  state.books.forEach((book) => {
    book.chapters.forEach((chapter) => {
      if (chapter.chapterid === chapterid) return;
      items.push({
        label: `${chapter.title} - ${book.title}`,
        onClick: () => {
          dispatch(
            librarySlice.actions.setEmbeddedChapter({
              index,
              bookid: book.bookid,
              chapterid: chapter.chapterid,
            })
          );
        },
        icon: null,
        //<ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden="true" />
      });
    });
  });

  return (
    <div>
      <div className="flex">
        {chapter && <h3 className="mr-xs">{chapter.title}</h3>}
        <Button
          size="small"
          style="secondary"
          rounded={true}
          onClick={() => setOpen(!open)}
        >
          {chapter ? "Change" : "Select"}
        </Button>
        {chapter && (
          <Link
            to={`/book/${book.bookid}/chapter/${chapter.chapterid}`}
            className="ml-xs text-sm align-baseline uppercase"
          >
            Visit
          </Link>
        )}
      </div>
      <div className="bg-gray-800 p-sm rounded mt-sm">
        <ReadOnlyView textBlocks={chapter.text} fontClass="sansSerif" />
      </div>
      <Launcher items={items} open={open} close={() => setOpen(false)} />
    </div>
  );
  /*   return (
    <div>
      <div className="flex">
        <Select
          name={"bookid"}
          title="Book"
          value={text.bookid}
          onChange={(e) =>
            dispatch(
              librarySlice.actions.setEmbeddedBookId({
                index,
                bookid: e.target.value,
              })
            )
          }
        >
          {state.books.map((book) => (
            <option key={book.bookid} value={book.bookid}>
              {book.title}
            </option>
          ))}
        </Select>
        {text.bookid && (
          <Select
            name={"chapterid"}
            title="Chapter"
            value={text.chapterid}
            onChange={(e) =>
              dispatch(
                librarySlice.actions.setEmbeddedChapterId({
                  index,
                  chapterid: e.target.value,
                })
              )
            }
          >
            {state.books.map((book) => (
              <option key={book.chapterid} value={book.chapterid}>
                {book.title}
              </option>
            ))}
          </Select>
        )}
      </div>
    </div>
  ); */
}
