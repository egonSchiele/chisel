import React from "react";
import { syllable } from "syllable";

const countSyllables = (text: string) => {
  try {
    return syllable(text);
  } catch (error) {
    console.error("Error counting syllables:", error);
    return 0;
  }
};

export default function Info({ text }) {
  const word_count = text.trim().split(/\s+/).length;
  const syllable_count = countSyllables(text.trim());
  return (
    <div className="text-sm xl:text-md">
      <p>
        {word_count}
        {' '}
        <span className="text-gray-400">words</span>
      </p>
      <p>
        {syllable_count}
        {' '}
        <span className="text-gray-400">syllables</span>
      </p>
    </div>
  );
}
