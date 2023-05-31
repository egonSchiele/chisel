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
  librarySlice,
} from "./reducers/librarySlice";
import { RootState } from "./store";
import { text } from "express";
import LibraryContext from "./LibraryContext";
import Spinner from "./components/Spinner";

type ChatHistory = {
  tag: "user" | "ai";
  text: string;
};

function Chat({ tag, text, className = null }) {
  return (
    <div
      className={`p-xs mb-sm rounded ${
        tag === "user" ? "bg-gray-800" : "bg-gray-600"
      } ${className}`}
    >
      {text}
    </div>
  );
}

export default function ChatSidebar() {
  const state: EditorState = useSelector(
    (state: RootState) => state.library.editor
  );
  const currentBook = useSelector(getSelectedBook);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { settings } = useContext(LibraryContext) as LibraryContextType;
  const [chatHistory, setChatHistory] = React.useState<ChatHistory[]>([]);
  const [chatInput, setChatInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function sendChat() {
    setLoading(true);
    const newChatHistory = [...chatHistory];
    newChatHistory.push({ tag: "user", text: chatInput });
    setChatHistory(newChatHistory);

    const result = await fd.fetchSuggestions(
      "",
      "",
      settings.model,
      settings.num_suggestions,
      settings.max_tokens,
      chatInput,
      null
    );

    if (result.tag === "error") {
      dispatch(librarySlice.actions.setError(result.message));
      return;
    }

    result.payload.forEach((choice: { text: any }) => {
      const generatedText = choice.text;
      newChatHistory.push({ tag: "ai", text: generatedText });
    });

    setLoading(false);
    setChatHistory(newChatHistory);
  }

  const items: any[] = [];

  chatHistory.forEach((chat, i) => {
    items.push(<Chat key={i} {...chat} />);
  });
  items.push(
    <Input
      key="input"
      value={chatInput}
      onChange={(e) => setChatInput(e.target.value)}
      name="chatInput"
      title="Input"
    />,
    <Button style="secondary" key="send" onClick={sendChat} className="w-full">
      Send
    </Button>
  );

  const spinner = {
    label: "Loading",
    icon: <Spinner className="w-5 h-5" />,
    onClick: () => {},
  };

  return (
    <List
      title="Chat"
      items={items}
      leftMenuItem={loading ? spinner : null}
      rightMenuItem={null}
      className="bg-sidebarSecondary dark:bg-dmsidebarSecondary border-l border-b border-gray-700 w-48"
      selector="chatList"
    />
  );
}
