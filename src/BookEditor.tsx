import * as t from "./Types";
import * as fd from "./lib/fetchData";
import md5 from "md5";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store";
import React, { useContext } from "react";
import {
  getSelectedBook,
  getSelectedBookChapters,
  librarySlice,
} from "./reducers/librarySlice";
import ContentEditable from "./components/ContentEditable";
import TextArea from "./components/TextArea";
import { Book, Character } from "./Types";
import Button from "./components/Button";
import Input from "./components/Input";
import { getChapterText, isString } from "./utils";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import { chapterToMarkdown } from "./serverUtils";
import LibraryContext from "./LibraryContext";

function Character({
  character,
  onNameChange,
  onDescChange,
  onImageUrlChange,
  onDelete,
}: {
  character: Character;
  onNameChange: (newName: string) => void;
  onDescChange: (newDesc: string) => void;
  onImageUrlChange: (newImageUrl: string) => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col my-sm bg-gray-200 dark:bg-gray-700 rounded-md p-sm">
      {character.imageUrl && character.imageUrl.trim() !== "" && (
        <img
          src={character.imageUrl}
          alt={character.name}
          className=" rounded-full mx-auto mb-sm max-h-96"
        />
      )}
      <Input
        name="name"
        title="name"
        value={character.name}
        onChange={(e) => onNameChange(e.target.value)}
        selector={`character-${character.name}-name`}
      />
      <TextArea
        name="description"
        title="description"
        value={character.description}
        onChange={(e) => onDescChange(e.target.value)}
        inputClassName="border-0 resize-none"
        rows={8}
        selector={`character-${character.name}-description`}
      />
      <Input
        name="imageUrl"
        title="Image Url"
        value={character.imageUrl}
        onChange={(e) => onImageUrlChange(e.target.value)}
        selector={`character-${character.name}-imageUrl`}
      />
      <Button
        onClick={onDelete}
        className="mt-sm"
        size="medium"
        style="secondary"
        rounded={true}
      >
        Delete
      </Button>
    </div>
  );
}

function Chapter({ chapter, bookid }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { deleteChapter } = useContext(LibraryContext) as t.LibraryContextType;

  function _deleteChapter() {
    const chapterid = chapter.chapterid;
    dispatch(librarySlice.actions.loading());
    fd.deleteChapter(bookid, chapterid).then((res) => {
      dispatch(librarySlice.actions.loaded());
      if (res.tag === "error") {
        dispatch(librarySlice.actions.setError(res.message));
      }
    });
    deleteChapter(chapterid);
  }

  return (
    <div
      className="flex flex-col my-sm bg-gray-200 dark:bg-gray-700 rounded-md p-sm cursor-pointer"
      onClick={() => navigate(`/book/${bookid}/chapter/${chapter.chapterid}`)}
    >
      <h3 className="text-xl font-semibold">{chapter.title}</h3>
      <pre className="text-gray-800 dark:text-gray-300 font-sans">
        {getChapterText(chapter).slice(0, 250)}
      </pre>
      <Button onClick={_deleteChapter} className="mt-sm w-20" style="secondary">
        Delete
      </Button>
    </div>
  );
}

function Block({ block, chapterid, bookid, index }) {
  const navigate = useNavigate();
  return (
    <div
      className="flex flex-col my-sm bg-gray-200 dark:bg-gray-700 rounded-md p-sm cursor-pointer"
      onClick={() => navigate(`/book/${bookid}/chapter/${chapterid}/${index}`)}
    >
      {/* <h3 className="text-xl font-semibold">{chapter.title}</h3> */}
      <pre className="text-gray-800 dark:text-gray-300 font-sans">
        {block.text.substring(0, 250)}
      </pre>
    </div>
  );
}

function formatDate(date: number) {
  return new Date(date).toLocaleString();
}

function TrainingData({ book }: { book: Book }) {
  const [question, setQuestion] = React.useState("");
  const [answer, setAnswer] = React.useState(null);
  const dispatch = useDispatch();
  const trained = !!book.lastTrainedAt;
  const buttonLabel = trained ? "Re-Train" : "Train";
  const fudgeFactor = 1000 * 3; // 3 seconds
  const staleChapters = book.chapters.filter(
    (chapter) =>
      !chapter.embeddingsLastCalculatedAt ||
      chapter.created_at > chapter.embeddingsLastCalculatedAt + fudgeFactor
  );
  const stale = staleChapters.length > 0;
  return (
    <div>
      {trained && (
        <div className="flex flex-col my-sm bg-gray-200 dark:bg-gray-700 rounded-md p-sm">
          <div className="">Last Trained</div>
          <div className="font-semibold">{formatDate(book.lastTrainedAt)}</div>
        </div>
      )}
      {!trained && <p>Never Trained</p>}
      {trained && stale && (
        <p className="bg-yellow-200 dark:bg-yellow-700 p-xs my-xs text-lg">
          Stale
        </p>
      )}
      <ul className="text-md list-disc">
        {trained &&
          stale &&
          staleChapters.map((chapter, i) => (
            <li key={i}>
              <Link
                to={`/book/${book.bookid}/chapter/${chapter.chapterid}`}
                className=""
              >
                {chapter.title} (last updated: {formatDate(chapter.created_at)},
                last trained: {formatDate(chapter.embeddingsLastCalculatedAt)} )
              </Link>
            </li>
          ))}
      </ul>

      <Button
        onClick={async () => {
          const lastTrainedAt = await fd.trainOnBook(book.bookid);
          if (lastTrainedAt.tag === "success") {
            dispatch(
              librarySlice.actions.setLastTrainedAt(lastTrainedAt.payload)
            );
          } else {
            dispatch(librarySlice.actions.setError(lastTrainedAt.message));
          }
        }}
        className="mt-sm"
        size="medium"
        style="secondary"
        rounded={true}
      >
        {buttonLabel}
      </Button>
      <h2 className="text-xl font-semibold mt-md mb-xs">Ask a question</h2>
      <div className="flex flex-col my-sm bg-gray-200 dark:bg-gray-700 rounded-md p-sm">
        <Input
          name="question"
          title="Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          selector={`question`}
        />
        <Button
          onClick={async () => {
            setAnswer("...");
            const _answer = await fd.askQuestion(book.bookid, question);
            if (_answer.tag === "success") {
              setAnswer(_answer.payload);
            } else {
              dispatch(librarySlice.actions.setError(_answer.message));
            }
          }}
          className="mt-sm"
          size="medium"
          style="secondary"
          rounded={true}
        >
          Ask
        </Button>
        <div className="mt-sm">
          <h2 className="text-xl font-semibold mt-md mb-xs">Answer</h2>
          {answer && isString(answer) && <p>{answer}</p>}
          {answer && answer.answer && (
            <div className="flex flex-col my-sm bg-gray-200 dark:bg-gray-700 rounded-md p-sm">
              <p>{answer.answer}</p>
              <Link
                to={`/book/${book.bookid}/chapter/${answer.chapterid}/${answer.blockIndex}`}
                className="mt-sm underline-offset-2 underline text-gray-400"
              >
                Go to relevant text
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CompostBook() {
  const book = useSelector(getSelectedBook);
  return (
    <div className="mx-auto px-sm lg:px-md mt-0 h-full w-full">
      <h1 className="text-2xl mb-sm tracking-wide font-semibold text-darkest dark:text-lightest">
        Compost Heap
      </h1>
      <a
        href="https://egonschiele.github.io/chisel-docs/docs/advanced-features/compost"
        className="uppercase text-sm underline-offset-2 underline text-gray-400 "
      >
        What is a compost heap?
      </a>
      <div className="grid gap-sm grid-cols-1 md:grid-cols-2 2xl:grid-cols-3">
        {book.chapters &&
          book.chapters.map((chapter, i) => (
            <Chapter key={i} chapter={chapter} bookid={book.bookid} />
          ))}
      </div>
    </div>
  );
}

export default function BookEditor({ className = "" }) {
  const book = useSelector(getSelectedBook);
  const chapters = useSelector(getSelectedBookChapters);
  const dispatch = useDispatch();
  let referenceBlocks = [];
  const chapterHashes = {};
  if (chapters) {
    chapters.forEach((chapter) => {
      chapter.text.forEach((block, index) => {
        if (block.reference) {
          referenceBlocks.push({ block, index, chapterid: chapter.chapterid });
        }
      });
      const markdown = chapterToMarkdown(chapter);
      if (markdown.trim() !== "") {
        const key = md5(markdown.trim());
        if (chapterHashes[key]) {
          chapterHashes[key].push(chapter);
        } else {
          chapterHashes[key] = [chapter];
        }
      }
    });
  }

  const dupes = [];
  for (const key in chapterHashes) {
    if (chapterHashes[key].length > 1) {
      dupes.push(chapterHashes[key]);
    }
  }

  if (!book) {
    return <div>loading</div>;
  }
  if (book.tag === "compost") {
    return <CompostBook />;
  }
  return (
    <div
      className={`flex h-screen overflow-auto w-fit ${className}`}
      id="bookeditor"
    >
      <div className="mx-auto px-sm lg:px-md h-screen w-fit">
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
          inputClassName="typography border-0 bg-editor text-editortext dark:bg-dmeditor dark:text-dmeditortext resize-none"
          rows={8}
        />

        <div className="text-xl font-semibold mt-md mb-xs">
          <span>Characters</span>
          <Button
            onClick={() => {
              dispatch(librarySlice.actions.addCharacter());
            }}
            rounded={true}
            className="ml-xs"
            size="small"
            selector="add-character-button"
          >
            Add Character
          </Button>
        </div>

        <div className="grid gap-sm grid-cols-1 md:grid-cols-2 2xl:grid-cols-3">
          {book.characters &&
            book.characters.map((character, i) => (
              <Character
                key={i}
                character={character}
                onNameChange={(newName) =>
                  dispatch(
                    librarySlice.actions.editCharacter({
                      index: i,
                      character: { ...character, name: newName },
                    })
                  )
                }
                onDescChange={(newDesc) =>
                  dispatch(
                    librarySlice.actions.editCharacter({
                      index: i,
                      character: { ...character, description: newDesc },
                    })
                  )
                }
                onImageUrlChange={(newImageUrl) =>
                  dispatch(
                    librarySlice.actions.editCharacter({
                      index: i,
                      character: { ...character, imageUrl: newImageUrl },
                    })
                  )
                }
                onDelete={() => {
                  dispatch(librarySlice.actions.deleteCharacter({ index: i }));
                }}
              />
            ))}
        </div>

        <div className="text-xl font-semibold mt-md mb-xs">
          <span>Chapters ({chapters ? chapters.length : 0})</span>
        </div>
        <div className="grid gap-sm grid-cols-1 md:grid-cols-2 2xl:grid-cols-3">
          {chapters &&
            chapters.map((chapter, i) => (
              <Chapter key={i} chapter={chapter} bookid={book.bookid} />
            ))}
        </div>

        <div className="text-xl font-semibold mt-md mb-xs">
          <span>Pinned ({referenceBlocks.length})</span>
        </div>
        <div className="grid gap-sm grid-cols-1 md:grid-cols-2 2xl:grid-cols-3">
          {referenceBlocks.length === 0 && <p>None yet.</p>}
          {referenceBlocks.map(({ block, chapterid, index }, i) => (
            <Block
              key={i}
              block={block}
              index={index}
              chapterid={chapterid}
              bookid={book.bookid}
            />
          ))}
        </div>
        {dupes.length > 0 && (
          <>
            <div className="text-xl font-semibold mt-md mb-xs">
              <span>Duplicates</span>
            </div>
            <p>The following chapters are duplicates of each other:</p>
            <div className="grid gap-sm grid-cols-1 md:grid-cols-2 2xl:grid-cols-3">
              {dupes.map((chapters, i) => (
                <ul
                  key={i}
                  className="list-decimal border border-gray-500 p-sm rounded-md my-sm text-md"
                >
                  {chapters.map((chapter, j) => (
                    <li key={j} className="ml-md">
                      <Link
                        to={`/book/${chapter.bookid}/chapter/${chapter.chapterid}`}
                      >
                        {chapter.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </>
        )}

        <div className="text-xl font-semibold mt-md mb-xs">
          <span>Training</span>
        </div>
        <div className="grid gap-sm grid-cols-1 md:grid-cols-2 2xl:grid-cols-3">
          <TrainingData book={book} />
        </div>
        {/* bottom padding */}
        <div className="h-24" />
      </div>
    </div>
  );
}
