import * as t from "./Types";
import Input from "./components/Input";
import * as fd from "./lib/fetchData";
import React, { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { EditorState, LibraryContextType } from "./Types";
import Button from "./components/Button";
import List from "./components/List";
import ListItem from "./components/ListItem";
import sortBy from "lodash/sortBy";

import {
  getSelectedBook,
  getSelectedChapter,
  getText,
  librarySlice,
} from "./reducers/librarySlice";
import { RootState } from "./store";
import { text } from "express";
import LibraryContext from "./LibraryContext";
import Spinner from "./components/Spinner";
import { useLocalStorage } from "./utils";
import TextArea from "./components/TextArea";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useColors } from "./lib/hooks";

function Chat({ role, content, className = null }) {
  return (
    <div
      className={`py-xs px-sm text-lg mb-sm rounded ${
        role === "user" ? "bg-gray-800" : "bg-gray-600"
      } ${className}`}
    >
      {content}
    </div>
  );
}

function Reveal({ label, toReveal }) {
  const [show, setShow] = React.useState(false);
  const buttonLabel = show ? `Hide ${label}` : `Show ${label}`;
  return (
    <div className="grid grid-cols-1 w-full m-xs">
      <Button
        style="secondary"
        onClick={() => setShow(!show)}
        className="mb-sm w-48"
      >
        {buttonLabel}
      </Button>
      {show && (
        <Button
          style="secondary"
          onClick={() => navigator.clipboard.writeText(toReveal)}
          className="mb-sm w-48"
        >
          Copy to Clipboard
        </Button>
      )}
      {show && <pre>{toReveal}</pre>}
    </div>
  );
}

async function lastEdited() {
  const lastEditedRequest = new Request("/api/getLastEdited", {
    credentials: "include",
  });

  const cache = await caches.open("v1");
  const lastEditedResponse = await cache.match(lastEditedRequest);
  if (lastEditedResponse) {
    return await lastEditedResponse.json();
  } else {
    return null;
  }
}

const lastEditedResponse = await lastEdited();
const lastEditedTimestamp = lastEditedResponse
  ? new Date(lastEditedResponse.lastEdited).toString()
  : null;

async function cacheData() {
  const booksRequest = new Request("/api/books", {
    credentials: "include",
  });

  const cache = await caches.open("v1");
  const cachedBookData = await cache.match(booksRequest);
  if (!cachedBookData) {
    return null;
  }
  const data = await cachedBookData.json();
  return data;
}

const dataInCache = await cacheData();

async function backupCacheData() {
  const cache = await caches.open("v1");
  const cachedBookData = await cache.match("/api/books/backup");
  if (!cachedBookData) {
    return null;
  }
  const data = await cachedBookData.json();
  return data;
}

const backupDataInCache = await backupCacheData();

function ViewportSize() {
  return (
    <div className="text-sm mx-xs my-xs">
      Viewport:
      <span className="invisible sm:visible md:invisible">sm</span>
      <span className="invisible md:visible lg:invisible">md</span>
      <span className="invisible lg:visible xl:invisible">lg</span>
      <span className="invisible xl:visible 2xl:invisible">xl</span>
      <span className="invisible 2xl:visible">2xl and above</span>
    </div>
  );
}

export default function DebugSidebar() {
  const state: t.State = useSelector((state: RootState) => state.library);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { settings } = useContext(LibraryContext) as LibraryContextType;
  const colors = useColors();

  const line = (str) => (
    <ListItem title={str} key={str} className="w-full" selected={false} />
  );

  const pretty = (obj) => JSON.stringify(obj, null, 2);

  const items: any[] = [
    line(`Online? ${state.online}`),
    line(`Service worker running? ${state.serviceWorkerRunning}`),
    line(`From cache? ${state.fromCache}`),
    line(`Last edited raw: ${pretty(lastEditedResponse)}`),
    line(`Last edited as timestamp: ${pretty(lastEditedTimestamp)}`),
    <ViewportSize />,
    <Reveal label="Settings" toReveal={pretty(settings)} key="settings" />,
    <Reveal label="State" toReveal={pretty(state)} key="state" />,
    <Reveal
      label={`Data in Cache ${dataInCache ? "" : "(none)"}`}
      toReveal={pretty(dataInCache)}
      key="cacheData"
    />,
    <Reveal
      label={`Backup Data in Cache ${backupDataInCache ? "" : "(none)"}`}
      toReveal={pretty(backupDataInCache)}
      key="backupCacheData"
    />,
  ];

  return (
    <List
      title="Debug"
      items={items}
      leftMenuItem={null}
      rightMenuItem={null}
      className="border-r w-full"
      selector="debugList"
      showScrollbar={true}
    />
  );
}
