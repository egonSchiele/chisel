import React from "react";
import { useSelector } from "react-redux";
import { syllable } from "syllable";
import { RootState } from "./store";
import { getCharacters } from "./reducers/librarySlice";

const countSyllables = (text: string) => {
  try {
    return syllable(text);
  } catch (error) {
    console.error("Error counting syllables:", error);
    return 0;
  }
};

function CharacterInfo() {
  const editor = useSelector((state: RootState) => state.library.editor);
  const characters = useSelector(getCharacters);
  if (!characters) return null;
  if (editor && editor.selectedText && editor.selectedText.contents) {
    const character = characters.find(
      (character) =>
        character.name.toLowerCase() ===
        editor.selectedText.contents.toLowerCase()
    );
    if (character) {
      return (
        <div className="mt-sm bg-gray-200 dark:bg-gray-700 rounded-md p-sm">
          {character.imageUrl && character.imageUrl.trim() !== "" && (
            <img
              src={character.imageUrl}
              alt={character.name}
              className="rounded-full mx-auto mb-sm"
            />
          )}
          <p className="text-lg font-semibold">{character.name}</p>
          <p className="text-sm">{character.description}</p>
        </div>
      );
    }
  }
  return null;
}
export default function Info({ text }) {
  const word_count = text.trim().split(/\s+/).length;
  const syllable_count = countSyllables(text.trim());
  return (
    <div className="text-sm xl:text-md">
      <p>
        {word_count} <span className="text-gray-400">words</span>
      </p>
      <p>
        {Math.floor(word_count * (4 / 3))}{" "}
        <span className="text-gray-400">tokens (estimate)</span>
      </p>
      {/*  <p>
        {syllable_count} <span className="text-gray-400">syllables</span>
      </p> */}
      <CharacterInfo />
    </div>
  );
}
