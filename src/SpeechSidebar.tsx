import React, { useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import LibraryContext from "./LibraryContext";
import * as t from "./Types";
import Button from "./components/Button";
import List from "./components/List";
import {
  getSelectedBook,
  getSelectedChapter,
  getText,
  librarySlice,
} from "./reducers/librarySlice";
import { RootState } from "./store";
import { useColors } from "./lib/hooks";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import * as fd from "./lib/fetchData";
import Switch from "./components/Switch";
import { isTextishBlock, useInterval } from "./utils";
import InfoSection from "./components/InfoSection";
import Spinner from "./components/Spinner";
import { set } from "cypress/types/lodash";

const POLLY_SYNC_LIMIT = 3000;
const POLLY_ASYNC_LIMIT = 100_000;

const POLLY_SYNC_LIMIT_MESSAGE = `Your text is longer than ${POLLY_SYNC_LIMIT} characters, so it will be sent to AWS Polly asynchronously. You will be able to download the audio file when it's ready.`;

const POLLY_ASYNC_LIMIT_MESSAGE = `Your text is longer than ${POLLY_ASYNC_LIMIT} characters, so it will be truncated.`;

export default function SpeechSidebar() {
  const state = useSelector((state: RootState) => state.library.editor);
  const currentBook = useSelector(getSelectedBook);
  const index = state.activeTextIndex;
  const currentChapter = useSelector(getSelectedChapter);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const colors = useColors();
  const [speechTaskID, setSpeechTaskID] = React.useState<string>("");
  const [speechTaskStatus, setSpeechTaskStatus] = React.useState<string>("");
  const [fullChapter, setFullChapter] = React.useState<boolean>(false);
  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  if (!currentChapter) return null;

  async function textToSpeech(text) {
    if (text.length > POLLY_SYNC_LIMIT) {
      await textToSpeechLong(text);
    } else {
      await textToSpeechShort(text);
    }
  }

  async function textToSpeechShort(text) {
    setSpeechTaskStatus("Sending");
    setLoading(true);
    const res = await fd.textToSpeech(currentChapter.chapterid, text);
    setLoading(false);
    if (res.tag === "success") {
      setAudioBlob(res.payload.data);
      setSpeechTaskStatus("Done");
    } else {
      dispatch(librarySlice.actions.setError(res.message));
      setSpeechTaskStatus("Error");
    }
  }

  async function textToSpeechLong(text) {
    setSpeechTaskStatus("Sending");
    setLoading(true);
    const res = await fd.textToSpeechLong(currentChapter.chapterid, text);
    setLoading(false);
    if (res.tag === "success") {
      setSpeechTaskID(res.payload.data);
      setSpeechTaskStatus("Sent");
    } else {
      dispatch(librarySlice.actions.setError(res.message));
      setSpeechTaskStatus("Error");
    }
  }

  useInterval(() => {
    const func = async () => {
      if (speechTaskID && !audioBlob) {
        setLoading(true);
        const res = await fd.getSpeechTaskStatus(speechTaskID);
        setLoading(false);
        if (res.tag === "success") {
          if (res.payload.type === "status") {
            setSpeechTaskStatus(res.payload.status);
          } else if (res.payload.type === "audio") {
            setSpeechTaskStatus("Done");
            setAudioBlob(res.payload.data);
          }
        } else {
          dispatch(librarySlice.actions.setError(res.message));
        }
      }
    };
    func();
  }, 4000);

  const textToConvert = fullChapter
    ? currentChapter.text
        .filter((block) => !block.hideInExport && isTextishBlock(block))
        .map((block) => block.text)
        .join("\n")
    : currentChapter.text[index].text;

  const items = [
    <InfoSection text={textToConvert} showSyllables={false} key="info" />,
    <Switch
      label="Full chapter"
      enabled={fullChapter}
      setEnabled={() => setFullChapter((fullChapter) => !fullChapter)}
      divClassName="mt-sm"
      key="fullChapter"
    />,
  ];

  if (textToConvert.length > POLLY_SYNC_LIMIT) {
    items.push(
      <p
        key="syncLimitMessage"
        className={`text-sm py-xs ${colors.primaryTextColor}`}
      >
        {POLLY_SYNC_LIMIT_MESSAGE}
      </p>
    );
  }

  if (textToConvert.length > POLLY_ASYNC_LIMIT) {
    items.push(
      <p
        key="asyncLimitMessage"
        className={`text-sm py-xs ${colors.primaryTextColor}`}
      >
        {POLLY_ASYNC_LIMIT_MESSAGE}
      </p>
    );
  }

  items.push(
    <Button
      onClick={async () => {
        await textToSpeech(textToConvert);
      }}
      key="textToSpeech"
      style="secondary"
      className="w-full my-xs"
    >
      Convert
    </Button>,
    <div className="flex flex-col items-center my-xs" key="speechTaskStatus">
      {speechTaskStatus}
    </div>
  );

  if (speechTaskStatus === "Done") {
    items.push(
      <audio
        controls
        className="w-full my-xs"
        src={URL.createObjectURL(audioBlob)}
      ></audio>
    );
    const url = `/textToSpeech/task/${speechTaskID}`;
    items.push(
      <Button
        onClick={() => {
          window.open(url, "_blank");
        }}
        key="download"
        style="primary"
        className="w-full my-xs"
      >
        Download
      </Button>
    );
  }

  const spinner = {
    label: "Loading",
    icon: <Spinner className="w-5 h-5" />,
    onClick: () => {},
  };

  return (
    <List
      title="Speech"
      items={items}
      leftMenuItem={loading ? spinner : null}
      rightMenuItem={null}
      selector="speechList"
    />
  );
}
