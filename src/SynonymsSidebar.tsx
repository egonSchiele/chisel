import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as t from "./Types";
import { EditorState } from "./Types";
import Button from "./components/Button";
import InfoSection from "./components/InfoSection";
import Input from "./components/Input";
import List from "./components/List";
import ListItem from "./components/ListItem";
import * as fd from "./lib/fetchData";
import {
  getSelectedBook,
  getSelectedChapter,
  getText,
  librarySlice,
} from "./reducers/librarySlice";
import { RootState } from "./store";
import { capitalize, normalize } from "./utils";

function Definition({ definition }) {
  const [theDefinition, ...examples] = definition.glossary.split("; ");

  return (
    <div>
      <p className="text-lg text-gray-200">{capitalize(theDefinition)}:</p>
      {examples.map((example, i) => {
        return (
          <p key={i} className="text-lg text-gray-300 italic">
            {example}
          </p>
        );
      })}
      <span className="text-md text-gray-500">
        {definition.meta.words &&
          definition.meta.words
            .map((word, i) => {
              return word.word;
            })
            .join(", ")}
      </span>
    </div>
  );
}

export default function SynonymsSidebar() {
  const state: EditorState = useSelector(
    (state: RootState) => state.library.editor
  );
  const currentBook = useSelector(getSelectedBook);
  const index = state.activeTextIndex;
  const currentChapter = useSelector(getSelectedChapter);
  const currentText: t.CodeBlock = useSelector(getText(index)) as t.CodeBlock;
  const selectedText = useSelector(
    (state: RootState) => state.library.editor.selectedText
  );
  let text = currentText.text;
  if (selectedText && selectedText.contents) {
    text = selectedText.contents;
  }
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [synonymInput, setSynonymInput] = useState<string>("");
  const [synonyms, setSynonyms] = useState<string[]>([]);
  const [definition, setDefinition] = useState<string[]>([]);

  const fetchSynonyms = async () => {
    const res = await fd.fetchSynonyms(normalize(synonymInput));
    if (res.tag === "error") {
      dispatch(librarySlice.actions.setError(res.message));
      return;
    }

    setSynonyms(res.payload);
  };

  const fetchDefinition = async () => {
    const res = await fd.fetchDefinition(normalize(synonymInput));
    if (res.tag === "error") {
      dispatch(librarySlice.actions.setError(res.message));
      return;
    }

    setDefinition(res.payload);
  };

  useEffect(() => {
    if (selectedText && selectedText.contents) {
      setSynonymInput(selectedText.contents);
    }
  }, [selectedText]);

  const items = [
    <InfoSection text={text} showSyllables={true} />,
    <Input
      value={synonymInput}
      onChange={(e) => setSynonymInput(e.target.value)}
      name="synonyms"
      /*       title="Synonyms"
       */ key="synonyms"
      onKeyDown={async (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          await fetchSynonyms();
          await fetchDefinition();
        }
      }}
    />,
    <Button
      rounded={true}
      style={"secondary"}
      onClick={async () => {
        await fetchSynonyms();
        await fetchDefinition();
      }}
      className="w-full mb-md"
      key="getSynonyms"
    >
      Get synonyms
    </Button>,
  ];

  const defs = definition.map((def, i) => {
    return (
      <li key={i} className="mb-sm">
        <Definition definition={def} />
      </li>
    );
  });

  items.push(
    <>
      <label className="settings_label">Definition</label>

      <ul key="definitions" className="list-decimal px-sm mb-sm">
        {defs}
      </ul>
    </>
  );

  synonyms.forEach((synonym) => {
    items.push(
      <ListItem
        key={synonym}
        title={synonym}
        onClick={() => {
          setSynonymInput(synonym);
        }}
        selected={false}
        className="lg:text-md"
      />
    );
  });

  return (
    <List
      title="Synonyms"
      items={items}
      leftMenuItem={null}
      rightMenuItem={null}
      className="bg-sidebarSecondary dark:bg-dmsidebarSecondary border-l border-b border-gray-700 w-72"
      selector="synonymsList"
    />
  );
}
