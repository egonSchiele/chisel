import { XMarkIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import { NavButton } from "./NavButton";
import { hedges } from "hedges";
import { fillers } from "fillers";
import cliches from "./cliches";
import List from "./components/List";
import { syllable } from "syllable";
import Button from "./components/Button";
import ContentEditable from "./components/ContentEditable";

function FocusList({ words, index, onSynonymClick, onDelete, annotations }) {
  const selected = words[index];
  const [synonyms, setSynonyms] = useState([]);
  const fetchSynonyms = async (word) => {
    if (!selected) return;
    try {
      const res = await fetch(
        `https://api.datamuse.com/words?ml=${selected}&max=20`
      );
      const data = await res.json();
      const synonyms = data.map((item) => item.word);
      setSynonyms(synonyms);
    } catch (error) {
      console.error("Error fetching synonyms:", error);
    }
  };

  useEffect(() => {
    fetchSynonyms(selected);
  }, [selected]);

  let items = [];
  if (selected) {
    const syllableCount = syllable(selected);
    const annotationItems = [];
    annotations.forEach((annotation) => {
      if (annotation.type === "cliche") {
        let clicheString = [];
        let _index = annotation.startIndex;
        let i = 0;
        while (i < annotation.length) {
          clicheString.push(words[_index]);
          _index++;
          i++;
        }
        annotationItems.push({
          label: "part of a cliche",
          value: clicheString.join(" "),
        });
      }
    });
    items.push(
      <div className="grid grid-cols-1">
        <h1 className="text-4xl font-georgia my-sm antialiased font-light">
          {selected}
        </h1>
        <p className="text-md dark:text-white">
          {syllableCount} <span className="dark:text-gray-300">syllables</span>
        </p>
        {synonyms && (
          <div className="grid grid-cols-1">
            <p className="text-md dark:text-white">Synonyms:</p>
            <ul>
              {synonyms.map((synonym, i) => {
                return (
                  <li
                    key={i}
                    onClick={() => onSynonymClick(synonym)}
                    className="dark:text-gray-300 cursor-pointer max-w-fit h-5"
                  >
                    {synonym}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        <div className="mt-md">
          {annotationItems.map((item, i) => {
            return (
              <div key={i}>
                <p className="text-md uppercase">{item.label}</p>
                <p>{item.value}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-md">
          <Button
            onClick={() => {
              onDelete(index);
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    );
  }
  return (
    <List
      title={selected ? "Info" : "Select a word"}
      items={items}
      /*       rightMenuItem={rightMenuItem}
      leftMenuItem={leftMenuItem}
 */ className="bg-sidebarSecondary dark:bg-dmsidebarSecondary"
    />
  );
}

function normalize(word: string) {
  return word.toLowerCase().replace(/[^a-z]/g, "");
}

function findSubarray(array: any[], subarray: any[]) {
  const subarrayLength = subarray.length;
  for (let i = 0; i < array.length; i++) {
    if (array.slice(i, i + subarrayLength).join(" ") === subarray.join(" ")) {
      return i;
    }
  }
  return -1;
}

const clicheTextAsWords = cliches.map((fragment) =>
  fragment.split(" ").map(normalize)
);

type Annotation = {
  type: "hedge" | "filler" | "cliche";
  word?: string;
  alternatives?: string[];
  groupid?: number;
  startIndex?: number;
};

function Word({
  word,
  annotations,
  activeGroups,
  onHover,
  onLeave,
  index,
  onChange,
  isCurrentWord,
  setCurrentWord,
}: {
  word: string;
  annotations: Annotation[];
  activeGroups: number[];
  onHover: any;
  onLeave: any;
  index: number;
  onChange: any;
  isCurrentWord: boolean;
  setCurrentWord: any;
}) {
  const normalized = normalize(word);

  const simpleTags = annotations
    .filter((tag) => !tag.groupid)
    .map((tag) => tag.type);
  const tagsWithGroupid = annotations.filter((tag) => tag.groupid);
  const complexTags = tagsWithGroupid.map((tag) => tag.type);
  const groupids = tagsWithGroupid.map((tag) => tag.groupid);
  /* console.log("groupids", groupids); */
  const activeGroupids = groupids.filter((groupid) =>
    activeGroups.includes(groupid)
  );
  /*   console.log("activeGroupids", activeGroupids);
  console.log("activeGroups", activeGroups);
 */ let className = "";
  if (isCurrentWord) {
    className = "bg-gray-300 dark:bg-gray-600";
  }
  if (activeGroupids.length > 0) {
    className = "bg-gray-200 dark:bg-gray-700";
  }

  return (
    <div
      onMouseEnter={() => {
        onHover(groupids);
      }}
      onMouseLeave={() => {
        onLeave();
      }}
      onClick={() => {
        setCurrentWord(index);
      }}
      className={`flex-none max-w-fit cursor-pointer max-h-fit m-0 p-0 ${className}`}
    >
      <div className="text-4xl font-georgia font-light antialiased dark:text-white">
        {word}
      </div>
      {/*  <ContentEditable
        className="col-span-9 flex-grow text-md align-text-top"
        value={word}
        onSubmit={(newWord) => {
          onChange(index, newWord);
        }}
      /> */}
      <div className="text-sm font-light antialiased dark:text-gray-300">
        {simpleTags.join(" ")}
        {complexTags.join(" ")}
        {/*         {JSON.stringify(annotations)}
         */}{" "}
      </div>
    </div>
  );
}

export default function FocusMode({ text, onClose, onChange }) {
  const [history, setHistory] = useState([text]);
  const mostRecentText = history[history.length - 1];
  const [activeGroups, setActiveGroups] = useState([]);
  const [currentWord, setCurrentWord] = useState(null);
  const words = mostRecentText.split(" ");
  const normalizedWords = words.map(normalize);
  const wordAnnotations = {};

  for (let i = 0; i < words.length; i++) {
    wordAnnotations[i] = [];
  }

  let groupid = 1;
  clicheTextAsWords.forEach((clicheTextAsWord) => {
    const index = findSubarray(normalizedWords, clicheTextAsWord);
    if (index !== -1) {
      console.log("found cliche at index", index);
      console.log("cliche is", clicheTextAsWord);
      for (let i = index; i < index + clicheTextAsWord.length; i++) {
        wordAnnotations[i].push({
          type: "cliche",
          groupid,
          startIndex: index,
          length: clicheTextAsWord.length,
        });
      }
      groupid++;
    }
  });

  normalizedWords.forEach((word, i) => {
    if (hedges.includes(word)) {
      wordAnnotations[i].push({ type: "hedge" });
    }
    if (fillers.includes(word)) {
      wordAnnotations[i].push({ type: "filler" });
    }
  });

  function replaceWord(index, newWord) {
    const newWords = [...words];
    if (newWord === "") {
      newWords.splice(index, 1);
    } else {
      newWords[index] = newWord;
    }
    const newText = newWords.join(" ") + "\n";
    setHistory([...history, newText]);
    setCurrentWord(null);
  }

  useEffect(() => {
    onChange(mostRecentText);
  }, [mostRecentText]);

  function onSynonymClick(synonym) {
    replaceWord(currentWord, synonym);
  }

  function onDelete(index) {
    replaceWord(index, "");
  }

  const wordComponents = words.map((word: string, i: number) => {
    const annotations = wordAnnotations[i] || [];
    return (
      <Word
        key={i}
        word={word}
        annotations={annotations}
        onHover={setActiveGroups}
        onLeave={() => setActiveGroups([])}
        onChange={replaceWord}
        activeGroups={activeGroups}
        index={i}
        isCurrentWord={currentWord === i}
        setCurrentWord={setCurrentWord}
      />
    );
  });
  return (
    <div className="w-3/4 mx-auto">
      <div className="w-full flex flex-col flex-wrap mt-md">
        <div className="flex-grow" />
        <div className="flex-none">
          <NavButton label="Unsaved" onClick={onClose}>
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </NavButton>
        </div>
      </div>
      {/*  <h1 className="text-4xl font-georgia font-light antialiased dark:text-white">
        {JSON.stringify(activeGroups)}
      </h1> */}
      <div className="w-full flex">
        <div className="flex-grow flex max-w-screen-md mx-auto flex-wrap gap-xs">
          {wordComponents}
        </div>
        <div className="flex-none w-48">
          <FocusList
            words={words}
            index={currentWord}
            onSynonymClick={onSynonymClick}
            onDelete={onDelete}
            annotations={wordAnnotations[currentWord] || []}
          />
        </div>
      </div>
    </div>
  );
}
