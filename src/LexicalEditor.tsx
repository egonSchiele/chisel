import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  COMMAND_PRIORITY_HIGH,
  KEY_DOWN_COMMAND,
  RangeSelection,
  TextNode,
} from "lexical";
import React, { useEffect } from "react";
import * as t from "./Types";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import MyContentEditable from "./components/ContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import TreeViewPlugin from "./TreeViewPlugin";
import BoldTextPlugin, { BoldTextNode } from "./lexicalPlugins/BoldTextPlugin";

const theme = {
  // Theme styling goes here
  // ...
};

// When the editor changes, you can get notified via the
// LexicalOnChangePlugin!
function onChange(editorState, dispatch) {
  editorState.read(() => {
    // Read the contents of the EditorState here.
    const root = $getRoot();
    const selection = $getSelection() as RangeSelection;

    const text = root.getTextContent();

    if (text.match(/---(\s*)$/)) {
      console.log("found a match!");
    }

    dispatch({ type: "SET_SAVED", payload: false });
    dispatch({
      type: "SET_CONTENTS",
      payload: text,
    });
    dispatch({
      type: "SET_TEXT",
      payload: text,
    });

    const start = selection.anchor;
    const end = selection.focus;

    if (start.offset === end.offset) {
      dispatch({ type: "CLEAR_SELECTED_TEXT" });
      return;
    }
    let word;
    if (start.offset < end.offset) {
      word = text.slice(start.offset, end.offset).trim();
    } else {
      word = text.slice(end.offset, start.offset).trim();
    }

    dispatch({
      type: "SET_SELECTED_TEXT",
      payload: {
        index: start.offset,
        length: Math.abs(end.offset - start.offset),
        contents: word,
      },
    });

    console.log(root, selection);
  });
}

function OnSavePlugin({ onSave }) {
  const [editor] = useLexicalComposerContext();

  editor.registerCommand(
    KEY_DOWN_COMMAND,
    (event: KeyboardEvent) => {
      if (event.metaKey && event.code === "KeyS") {
        event.preventDefault();
        console.log("saving!");
        onSave();
        return true;
      }

      return false;
    },
    COMMAND_PRIORITY_HIGH
  );

  return null;
}

function OnFocusPlugin({ text, chapterid, pushTextToEditor }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Focus the editor when the effect fires!
    editor.update(() => {
      const root = $getRoot();

      // Create a new ParagraphNode
      const paragraphNode = $createParagraphNode();

      // Create a new TextNode
      const textNode = $createTextNode(text);

      // Append the text node to the paragraph
      paragraphNode.append(textNode);

      root.clear();
      root.append(paragraphNode);
    });
    editor.focus();
  }, [editor, chapterid, pushTextToEditor]);

  /*   const removeTransform = editor.registerNodeTransform(TextNode, (textNode) => {
    console.log("transforming text node", textNode.getTextContent());
    if (textNode.getTextContent() === "blue") {
      if (!textNode.hasFormat("bold")) {
        textNode.toggleFormat("bold");
      }
      //textNode.setTextContent("green");
    }
  }); */

  return null;
}

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error) {
  console.error(error);
}

function LexicalEditor({
  dispatch,
  state,
  chapterid,
  saved,
  onSave,
}: {
  dispatch: (action: any) => t.State;
  state: t.EditorState;
  chapterid: string;
  saved: boolean;
  onSave: () => void;
}) {
  const initialConfig = {
    namespace: "MyLexicalEditor",
    theme,
    nodes: [BoldTextNode],
    onError,
  };

  const queryParameters = new URLSearchParams(window.location.search);
  const debug = queryParameters.get("debug");

  return (
    <div className="w-3/4 mx-auto">
      <MyContentEditable
        value={state.title}
        className="text-2xl mb-sm tracking-wide font-semibold text-darkest dark:text-lightest"
        onSubmit={(title) => {
          dispatch({ type: "SET_TITLE", payload: title });
        }}
        /* nextFocus={focus} */
        selector="text-editor-title"
      />

      <LexicalComposer initialConfig={initialConfig}>
        <PlainTextPlugin
          contentEditable={<ContentEditable />}
          placeholder={<div>Enter some text...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <OnChangePlugin
          onChange={(editorState) => onChange(editorState, dispatch)}
        />
        <HistoryPlugin />
        <OnFocusPlugin
          text={state.text}
          chapterid={chapterid}
          pushTextToEditor={state._pushTextToEditor}
        />
        <OnSavePlugin
          onSave={() => {
            dispatch({ type: "SET_SAVED", payload: false });
            onSave();
          }}
        />

        <BoldTextPlugin />
        {debug && <TreeViewPlugin />}
        {/*         <CodeHighlightPlugin />
        <ListPlugin />
        <LinkPlugin />
        <AutoLinkPlugin />
        <ListMaxIndentLevelPlugin maxDepth={7} />
 */}
        {/*         <CollapsiblePlugin /> */}
      </LexicalComposer>
    </div>
  );
}

export default LexicalEditor;
