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
  if (!currentChapter) return null;

  async function textToSpeech(text) {
    setSpeechTaskStatus("Sending");
    const res = await fd.textToSpeechLong(currentChapter.chapterid, text);
    console.log({ res });
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
      if (speechTaskID && speechTaskStatus !== "Done") {
        const res = await fd.getSpeechTaskStatus(speechTaskID);
        console.log({ res });
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

  const items = [
    <Switch
      label="Full chapter"
      enabled={fullChapter}
      setEnabled={() => setFullChapter((fullChapter) => !fullChapter)}
      divClassName="mt-sm"
      key="fullChapter"
    />,
    <Button
      onClick={async () => {
        const text = fullChapter
          ? currentChapter.text
              .filter((block) => !block.hideInExport && isTextishBlock(block))
              .map((block) => block.text)
              .join("\n")
          : currentChapter.text[index].text;
        await textToSpeech(text);
      }}
      key="textToSpeech"
      style="secondary"
      className="w-full my-xs"
    >
      Convert
    </Button>,
    <div className="flex flex-col items-center my-xs" key="speechTaskStatus">
      {speechTaskStatus}
    </div>,
  ];

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
        style="secondary"
        className="w-full my-xs"
      >
        Download
      </Button>
    );
  }

  return (
    <List
      title="Speech"
      items={items}
      leftMenuItem={null}
      rightMenuItem={null}
      selector="speechList"
    />
  );
}
