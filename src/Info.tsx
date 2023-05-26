import InfoSection from "./components/InfoSection";
import React from "react";
import { useSelector } from "react-redux";
import { syllable } from "syllable";
import { RootState } from "./store";
import { getCharacters } from "./reducers/librarySlice";
import readingTime from "reading-time/lib/reading-time";
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
function Line({ text, subtext }) {
  return (
    <p>
      {text} <span className="text-gray-400">{subtext}</span>
    </p>
  );
}
export default function Info({ text }) {
  return (
    <div className="text-sm xl:text-md">
      <InfoSection text={text} />
      <CharacterInfo />
    </div>
  );
}
