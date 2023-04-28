import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store";
import React from "react";
import { getSelectedBook, librarySlice } from "./reducers/librarySlice";
import ContentEditable from "./components/ContentEditable";
import TextArea from "./components/TextArea";
import { Character } from "./Types";
import Button from "./components/Button";
import Input from "./components/Input";
import { getChapterText } from "./utils";
import { Link, useNavigate } from "react-router-dom";

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
      {character.imageUrl.trim() !== "" && (
        <img
          src={character.imageUrl}
          alt={character.name}
          className=" rounded-full mx-auto mb-sm"
        />
      )}
      <Input
        name="name"
        title="name"
        value={character.name}
        onChange={(e) => onNameChange(e.target.value)}
      />
      <TextArea
        name="description"
        title="description"
        value={character.description}
        onChange={(e) => onDescChange(e.target.value)}
        inputClassName="border-0 resize-none"
        rows={8}
      />
      <Input
        name="imageUrl"
        title="Image Url"
        value={character.imageUrl}
        onChange={(e) => onImageUrlChange(e.target.value)}
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
  return (
    <div
      className="flex flex-col my-sm bg-gray-200 dark:bg-gray-700 rounded-md p-sm cursor-pointer"
      onClick={() => navigate(`/book/${bookid}/chapter/${chapter.chapterid}`)}
    >
      <h3 className="text-xl font-semibold">{chapter.title}</h3>
      <p className="text-gray-800 dark:text-gray-300">
        {getChapterText(chapter).slice(0, 500)}
      </p>
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
      <div className="grid gap-sm grid-cols-1 md:grid-cols-2 2xl:grid-cols-3">
        {book.chapters &&
          book.chapters.map((chapter, i) => (
            <Chapter key={i} chapter={chapter} bookid={book.bookid} />
          ))}
      </div>
    </div>
  );
}

export default function BookEditor() {
  const book = useSelector(getSelectedBook);
  const dispatch = useDispatch();
  if (!book) {
    return <div>loading</div>;
  }
  if (book.tag === "compost") {
    return <CompostBook />;
  }
  return (
    <div className="flex h-screen overflow-scroll w-full">
      <div className="mx-auto px-sm lg:px-md mt-0 h-full w-full">
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
          <span>Chapters</span>
        </div>
        <div className="grid gap-sm grid-cols-1 md:grid-cols-2 2xl:grid-cols-3">
          {book.chapters &&
            book.chapters.map((chapter, i) => (
              <Chapter key={i} chapter={chapter} bookid={book.bookid} />
            ))}
        </div>

        {/* bottom padding */}
        <div className="h-24" />
      </div>
    </div>
  );
}
