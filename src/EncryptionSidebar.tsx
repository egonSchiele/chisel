import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as t from "./Types";
import Header from "./components/Header";
import Input from "./components/Input";
import List from "./components/List";
import Switch from "./components/Switch";
import { useColors } from "./lib/hooks";
import {
  getSelectedBook,
  getSelectedChapter,
  librarySlice,
} from "./reducers/librarySlice";
import { RootState } from "./store";
import {
  classNames,
  encryptMessage,
  decryptMessage,
  useLocalStorage,
  prettyDate,
  encryptObject,
  decryptObject,
} from "./utils";

import { Tab } from "@headlessui/react";
import {
  InformationCircleIcon,
  Square2StackIcon,
} from "@heroicons/react/24/outline";
import BlockInfoSidebar from "./BlockInfoSidebar";
import LibraryContext from "./LibraryContext";
import VersionsSidebar from "./VersionsSidebar";
import Button from "./components/Button";
import TextArea from "./components/TextArea";
import { use } from "chai";

function ManuallyEncrypt({ password }) {
  const colors = useColors();
  const [text, setText] = useState("");
  const [encrypted, setEncrypted] = useState("");
  return (
    <div className="flex flex-col my-md">
      <TextArea
        name="encrypt"
        title="Text to encrypt"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
        }}
      />
      <Button
        onClick={() => {
          setEncrypted(encryptMessage(text, password));
        }}
        className="my-xs"
      >
        Encrypt
      </Button>
      <code
        className={`rounded my-sm ${colors.background} flex-wrap break-words`}
      >
        {encrypted}
      </code>
    </div>
  );
}

function ManuallyEncryptChapter({ password }) {
  const colors = useColors();
  const [encrypted, setEncrypted] = useState("");
  const currentChapter = useSelector(getSelectedChapter);
  return (
    <div className="flex flex-col my-md">
      <code
        className={`rounded my-sm ${colors.background} flex-wrap break-words`}
      >
        {JSON.stringify(currentChapter, null, 2)}
      </code>

      <Button
        onClick={() => {
          setEncrypted(encryptObject(currentChapter, password));
        }}
        className="my-xs"
      >
        Encrypt Chapter
      </Button>
      <code
        className={`rounded my-sm ${colors.background} flex-wrap break-words`}
      >
        {JSON.stringify(encrypted, null, 2)}
      </code>
    </div>
  );
}

function ManuallyDecrypt({ password }) {
  const colors = useColors();
  const [text, setText] = useState("");
  const [decrypted, setDecrypted] = useState("");
  const [createdAt, setCreatedAt] = useState<number | null>(null);
  return (
    <div className="flex flex-col my-md">
      <TextArea
        name="decrypt"
        title="Text to Decrypt"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
        }}
      />
      <Button
        onClick={() => {
          const result = decryptMessage(text, password);
          setDecrypted(result.message);
          setCreatedAt(result.created_at);
        }}
        className="my-xs"
      >
        Decrypt
      </Button>
      <code
        className={`rounded my-sm ${colors.background} flex-wrap break-words`}
      >
        {decrypted}
      </code>
      {createdAt && (
        <p className="text-sm text-gray-500">{`Created at: ${prettyDate(
          createdAt
        )}`}</p>
      )}
      {!createdAt && decrypted && (
        <p className="text-sm text-gray-500">No timestamp found.</p>
      )}
    </div>
  );
}

function ManuallyDecryptObject({ password }) {
  const colors = useColors();
  const [text, setText] = useState("");
  const [decrypted, setDecrypted] = useState("");
  return (
    <div className="flex flex-col my-md">
      <TextArea
        name="decrypt"
        title="Text to Decrypt"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
        }}
      />
      <Button
        onClick={() => {
          const result = decryptObject(JSON.parse(text), password);
          setDecrypted(result);
        }}
        className="my-xs"
      >
        Decrypt Object
      </Button>
      <code
        className={`rounded my-sm ${colors.background} flex-wrap break-words`}
      >
        {JSON.stringify(decrypted, null, 2)}
      </code>
    </div>
  );
}

function ManualMode({ password }) {
  const colors = useColors();
  function getClassNames({ selected }) {
    const defaultClasses = "w-full py-1 text-sm font-medium text-center";
    return classNames(
      defaultClasses,
      selected ? `${colors.selectedBackground}` : `${colors.background}`
    );
  }

  return (
    <div className="w-full px-0 mt-lg">
      <Header className="mb-sm">Manual Mode</Header>
      <Tab.Group>
        <Tab.List className={`flex border-r ${colors.borderColor}`}>
          <Tab className={getClassNames}>Encrypt</Tab>
          <Tab className={getClassNames}>Decrypt</Tab>
          <Tab className={getClassNames}>Encrypt Chapter</Tab>
          <Tab className={getClassNames}>Decrypt Object</Tab>
        </Tab.List>
        <Tab.Panels className="">
          <Tab.Panel>
            <ManuallyEncrypt password={password} />
          </Tab.Panel>
          <Tab.Panel>
            <ManuallyDecrypt password={password} />
          </Tab.Panel>
          <Tab.Panel>
            <ManuallyEncryptChapter password={password} />
          </Tab.Panel>
          <Tab.Panel>
            <ManuallyDecryptObject password={password} />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}

export default function EncryptionSidebar() {
  const editHistory: t.EditHistory[] = useSelector(
    (state: RootState) => state.library.editHistory
  );
  const currentBook = useSelector(getSelectedBook);
  const currentChapter = useSelector(getSelectedChapter);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const colors = useColors();

  const books: t.Book[] = useSelector(
    (state: RootState) => state.library.books
  );
  const [encryptionPassword, setEncryptionPassword] = useLocalStorage(
    "encryptionPassword",
    { password: "" }
  );
  const { settings, setSettings } = useContext(
    LibraryContext
  ) as t.LibraryContextType;

  const [encryptionChanged, setEncryptionChanged] = useState(false);
  const [isEncrypted, setIsEncrypted] = useState(settings.encrypted);
  const [editPassword, setEditPassword] = useState(false);

  useEffect(() => {
    setIsEncrypted(settings.encrypted);
  }, [settings.encrypted]);

  async function confirmEncrypt() {
    setSettings({ ...settings, encrypted: true });
    dispatch(librarySlice.actions.setSettingsSaved(false));

    //dispatch(librarySlice.actions.setTriggerSaveAll(true));
  }

  async function confirmDecrypt() {
    setSettings({ ...settings, encrypted: false });
    dispatch(librarySlice.actions.setSettingsSaved(false));

    //dispatch(librarySlice.actions.setTriggerSaveAll(true));
  }

  const items = [
    <Switch
      label="Encrypt?"
      enabled={isEncrypted}
      setEnabled={(enabled) => {
        setEncryptionChanged(true);
        setIsEncrypted(enabled);
      }}
      divClassName="mt-sm"
    />,
  ];
  if (!encryptionChanged) {
    if (isEncrypted) {
      if (editPassword) {
        items.push(
          <Input
            title="Password"
            name="encryptionPassword"
            type="password"
            value={encryptionPassword?.password || ""}
            onChange={(e) =>
              setEncryptionPassword({ password: e.target.value })
            }
            className="my-0"
          />,
          <Button
            size="medium"
            onClick={() => {
              setEditPassword(false);
            }}
            style="secondary"
            rounded
            className="mt-0 w-full"
            selector={`editPasswordDoneButton`}
          >
            Done
          </Button>
        );
      } else {
        items.push(
          <Button
            size="medium"
            onClick={() => {
              setEditPassword(true);
            }}
            style="primary"
            rounded
            className="my-sm w-full"
            selector={`editPasswordButton`}
          >
            Edit Password
          </Button>
        );
      }
    }
  } else {
    if (isEncrypted) {
      items.push(
        <p className="text-md text-gray-500 mb-xs mt-md">
          1. Enter a password below. Remember, if you lose the password, we will
          not be able to help you recover your data!
        </p>,
        <Input
          title="Password"
          name="encryptionPassword"
          type="password"
          value={encryptionPassword?.password || ""}
          onChange={(e) => setEncryptionPassword({ password: e.target.value })}
          className="my-0"
        />,
        <p className="text-md text-gray-500 mb-xs mt-md">
          2. Click confirm encryption to encrypt all of your books.
        </p>,
        <Button
          size="medium"
          onClick={() => {
            confirmEncrypt();
            setEncryptionChanged(false);
          }}
          style="secondary"
          rounded
          className="w-full"
          selector={`confirmEncryptButton`}
        >
          Confirm Encryption
        </Button>
      );
    } else {
      items.push(
        <p className="text-md text-gray-500 mb-xs mt-md">
          Please confirm decryption by clicking the button below.
        </p>,
        <Button
          size="medium"
          onClick={() => {
            confirmDecrypt();
            setEncryptionChanged(false);
          }}
          style="secondary"
          rounded
          className="w-full"
          selector={`confirmEncryptButton`}
        >
          Confirm Decryption
        </Button>
      );
    }
  }

  items.push(<ManualMode password={encryptionPassword?.password || ""} />);

  return (
    <List
      title="Encryption"
      items={items}
      leftMenuItem={null}
      rightMenuItem={null}
      selector="encryptionList"
      className="border-l"
    />
  );
}
