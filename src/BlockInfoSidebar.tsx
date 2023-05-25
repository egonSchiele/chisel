import { RadioGroup } from "@headlessui/react";
import React, { useContext, useState } from "react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from "react-redux";
import ButtonGroup from "./components/ButtonGroup";
import Button from "./components/Button";
import * as t from "./Types";
import * as fd from "./lib/fetchData";
import List from "./components/List";
import Spinner from "./components/Spinner";
import { fetchSuggestionsWrapper } from "./utils";
import { RootState } from "./store";
import {
  getSelectedBook,
  getSelectedChapter,
  getText,
  librarySlice,
} from "./reducers/librarySlice";
import LibraryContext from "./LibraryContext";
import ListItem from "./components/ListItem";
import Switch from "./components/Switch";

import { languages } from "./lib/languages";
import Select from "./components/Select";
import Input from "./components/Input";

function BlockVersions({
  versions,
  setVersions,
}: {
  versions: string;
  setVersions: any;
}) {
  return (
    <div className="mt-sm">
      <h3 className="text-xl font-semibold">Versions</h3>
    </div>
  );
}

function BlockCaption({
  caption,
  setCaption,
}: {
  caption: string | null;
  setCaption: any;
}) {
  const [_caption, _setCaption] = useState(caption);
  if (!caption) {
    return (
      <>
        <label className="settings_label mt-sm">Caption</label>
        <Button
          style="secondary"
          size="medium"
          rounded={true}
          onClick={() => setCaption("new caption")}
          className="w-full my-xs"
        >
          Add Caption
        </Button>
      </>
    );
  } else {
    return (
      <>
        <label className="settings_label mt-sm">Caption</label>

        <div className="grid grid-cols-1">
          <Input
            className="w-full"
            type="text"
            value={_caption}
            onChange={(e) => _setCaption(e.target.value)}
          />
          <Button
            style="secondary"
            size="medium"
            rounded={true}
            onClick={() => setCaption(_caption)}
            className="w-full mb-xs"
          >
            Save
          </Button>
          <Button
            style="primary"
            size="medium"
            rounded={true}
            onClick={() => setCaption(null)}
            className="w-full"
          >
            Remove Caption
          </Button>
        </div>
      </>
    );
  }
}
function BlockLanguage({
  language,
  setLanguage,
}: {
  language: string;
  setLanguage: any;
}) {
  return (
    <div className="mt-sm">
      <Select
        title="Language"
        name="language"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        {languages.map((language) => (
          <option key={language} value={language}>
            {language}
          </option>
        ))}
      </Select>
    </div>
  );
}
function BlockType({ type, setType }: { type: t.BlockType; setType: any }) {
  let [plan, setPlan] = useState("startup");

  function getStyle(checked) {
    let styles =
      " w-full p-xs my-1 rounded-md border border-gray-300 dark:border-gray-700 text-sm cursor-pointer flex hover:bg-gray-100 dark:hover:bg-gray-700";
    if (checked) {
      styles += " bg-blue-700 hover:bg-blue-500 dark:hover:bg-blue-500";
    }
    return styles;
  }

  function option(type, label) {
    return (
      <RadioGroup.Option value={type}>
        {({ checked }) => (
          <div className={getStyle(checked)}>
            <span className="flex-grow">{label}</span>
            {checked && (
              <div className="shrink-0 text-white">
                <CheckIcon className="h-5 w-5" />
              </div>
            )}
          </div>
        )}
      </RadioGroup.Option>
    );
  }

  return (
    <RadioGroup value={type} onChange={setType} className={"grid grid-cols-1"}>
      <RadioGroup.Label className="settings_label">Type</RadioGroup.Label>
      {option("plain", "Plain")}
      {option("markdown", "Markdown")}
      {option("code", "Code")}
      {option("embeddedText", "Embedded Text")}
    </RadioGroup>
  );
}

export default function BlockInfoSidebar({}: {}) {
  const state = useSelector((state: RootState) => state.library.editor);
  const currentBook = useSelector(getSelectedBook);
  const currentText = useSelector(getText(state.activeTextIndex));
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { settings } = useContext(LibraryContext) as t.LibraryContextType;

  if (!currentText) return null;

  const listItems: any[] = [];
  if (currentText.open) {
    listItems.push(
      <li key="close">
        <Button
          style="secondary"
          size="medium"
          rounded={true}
          onClick={() =>
            dispatch(librarySlice.actions.closeBlock(state.activeTextIndex))
          }
          className="w-full my-sm"
        >
          Close Block
        </Button>
      </li>
    );
  } else {
    listItems.push(
      <li key="open">
        <Button
          style="secondary"
          size="medium"
          rounded={true}
          onClick={() =>
            dispatch(librarySlice.actions.openBlock(state.activeTextIndex))
          }
          className="w-full my-sm"
        >
          Open Block
        </Button>
      </li>
    );
  }
  listItems.push(
    <li key="type">
      <BlockType
        type={currentText.type}
        setType={(newType) =>
          dispatch(
            librarySlice.actions.setBlockType({
              index: state.activeTextIndex,
              type: newType,
            })
          )
        }
      />
    </li>
  );

  if (currentText.type === "code") {
    listItems.push(
      <li key="language">
        <BlockLanguage
          language={currentText.language as string}
          setLanguage={(newLanguage) => {
            console.log({ newLanguage });
            dispatch(
              librarySlice.actions.setLanguage({
                index: state.activeTextIndex,
                language: newLanguage,
              })
            );
          }}
        />
      </li>
    );
  }

  listItems.push(
    <li key="reference">
      <Switch
        label="Reference"
        enabled={currentText.reference}
        setEnabled={() =>
          dispatch(librarySlice.actions.toggleReference(state.activeTextIndex))
        }
        className="mt-sm"
      />
    </li>
  );

  listItems.push(
    <li key="caption">
      <BlockCaption
        // @ts-ignore
        caption={currentText.caption}
        setCaption={(newCaption) =>
          dispatch(
            librarySlice.actions.addCaption({
              index: state.activeTextIndex,
              caption: newCaption,
            })
          )
        }
      />
    </li>
  );

  listItems.push(
    <li key="versions">
      <BlockVersions
        // @ts-ignore
        versions={currentText.versions}
        setVersions={(newVersions) => {}}
      />
    </li>
  );

  return (
    <List
      title="Block Info"
      items={listItems}
      leftMenuItem={null}
      rightMenuItem={null}
      className="bg-sidebarSecondary dark:bg-dmsidebarSecondary border-r border-b border-gray-700"
      selector="blockInfoList"
    />
  );
}
