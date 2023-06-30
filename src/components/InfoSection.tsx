import React from "react";
import { useSelector } from "react-redux";
import { syllable } from "syllable";
import { RootState } from "../store";
import { getCharacters } from "../reducers/librarySlice";
import readingTime from "reading-time/lib/reading-time";
import { round } from "../utils";
const countSyllables = (text: string) => {
  try {
    return syllable(text);
  } catch (error) {
    console.error("Error counting syllables:", error);
    return 0;
  }
};
function Line({ text, subtext }) {
  return (
    <p>
      {text} <span className="text-gray-400">{subtext}</span>
    </p>
  );
}
export default function InfoSection({
  text,
  showSyllables = false,
  showPollyCost = false,
}) {
  const word_count = text.trim().split(/\s+/).length;
  const syllable_count = showSyllables ? countSyllables(text.trim()) : 0;
  const pollyCharacterCost = 4.0 / 1_000_000.0;
  return (
    <div className="text-sm xl:text-md">
      <Line text={text.length} subtext="characters" />
      <Line text={word_count} subtext="words" />
      {showSyllables && <Line text={syllable_count} subtext="syllables" />}
      <Line
        text={Math.floor(word_count * (4 / 3))}
        subtext="tokens (estimate)"
      />

      <Line text={readingTime(text).text} subtext="" />
      {showPollyCost && (
        <Line
          text={`$${text.length * pollyCharacterCost}`}
          subtext="smackers"
        />
      )}

      {/*  <p>
          {syllable_count} <span className="text-gray-400">syllables</span>
        </p> */}
    </div>
  );
}
