import InfoSection from "./components/InfoSection";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { syllable } from "syllable";
import { RootState } from "./store";
import { getCharacters, getSelectedChapter } from "./reducers/librarySlice";
import readingTime from "reading-time/lib/reading-time";
import { getChapterText, useLocalStorage } from "./utils";
import Switch from "./components/Switch";
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
export default function Info() {
  const state = useSelector((state: RootState) => state.library);
  const dispatch = useDispatch();
  const currentChapter = useSelector(getSelectedChapter);
  const [showHidden, setShowHidden] = useLocalStorage("Info/showHidden", false);
  if (!currentChapter) return null;
  let infoText = getChapterText(currentChapter, showHidden);
  if (state.editor.selectedText.length > 0) {
    infoText = state.editor.selectedText.contents;
  }

  return (
    <div className="text-sm xl:text-md">
      <InfoSection text={infoText} />
      <Switch
        label="Show hidden in export?"
        enabled={showHidden}
        setEnabled={setShowHidden}
      />
      <CharacterInfo />
    </div>
  );
}
