import React from 'react';
import { syllable } from 'syllable';
const countSyllables = (text: string) => {
    try {
      return syllable(text);
    } catch (error) {
      console.error("Error counting syllables:", error);
      return 0;
    }
  };
  
export default function Info({text}) {
    const word_count = text.trim().split(/\s+/).length;
    const syllable_count = countSyllables(text.trim());
    return <div>
        <p>Word count: {word_count} words</p>
        <p>Syllable count: {syllable_count} syllables</p>
        </div>
}