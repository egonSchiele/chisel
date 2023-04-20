import {
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
} from "@heroicons/react/24/solid";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalTextEntity } from "@lexical/react/useLexicalTextEntity";
import {
  DecoratorNode,
  NodeKey,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  $insertNodes,
  LexicalCommand,
  createCommand,
  $getRoot,
  $getSelection,
  RangeSelection,
  TextNode,
  LineBreakNode,
  SerializedLexicalNode,
  ElementNode,
  SerializedElementNode,
  KEY_BACKSPACE_COMMAND,
  COMMAND_PRIORITY_LOW,
  $getNodeByKey,
  $isLineBreakNode,
  $createTextNode,
  $createParagraphNode,
  KEY_ENTER_COMMAND,
  $isTextNode,
  $isRangeSelection,
  KEY_ARROW_DOWN_COMMAND,
  $createLineBreakNode,
  $isParagraphNode,
  KEY_MODIFIER_COMMAND,
  SerializedTextNode,
} from "lexical";
import React, { ReactNode, useCallback, useEffect, useState } from "react";
import { BoldTextNode, $createBoldTextNode } from "./BoldTextPlugin";
import { $findMatchingParent } from "@lexical/utils";

const FOLDABLE_REGEX = /^> (.+)$/;

export class FoldableNode extends TextNode {
  __text: string;

  static getType(): string {
    return "Foldable";
  }

  static clone(node: FoldableNode): FoldableNode {
    return new FoldableNode(node.__text, node.__open, node.__key);
  }

  constructor(text: string, open: boolean, key?: NodeKey) {
    super(key);
    this.__text = text;
    this.__open = open;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const container = document.createElement("div");
    container.className = "flex display-block";
    container.contentEditable = "false";
    /*     const button = document.createElement("div");
    button.className = "w-5 h-5 cursor-pointer mb-xs";
    button.innerText = ">";
    container.appendChild(button);
 */ const details = document.createElement("details");
    details.className =
      "flex-grow bg-gray-700 pl-2 border-l-4 border-red-700 select-text display-block";

    let firstLine = this.__text.split("\n")[0];
    if (firstLine.length > 80) {
      firstLine = firstLine.substring(0, 80) + "...";
    }

    const summary = document.createElement("summary");
    summary.innerText = firstLine;

    details.innerText = this.__text.substring(Math.min(firstLine.length, 80));
    details.appendChild(summary);
    console.log({ summary });
    details.open = this.__open;
    container.appendChild(details);

    const button = document.createElement("div");
    button.className = "bg-gray-500 px-2 h-full cursor-pointer delete-foldable";
    button.innerText = "x";
    button.setAttribute("data-key", this.__key);

    container.appendChild(button);

    console.log("creating details wihth text:", this.__text);

    /*    details.addEventListener("toggle", (event) => {
      this.__open = details.open;
    }); */

    //div.style.display = "contents";
    return container;
  }

  updateDOM(prevNode: TextNode, dom: HTMLDetailsElement): false {
    //console.log(this.__text, prevNode.__text, dom.innerText);
    const details = dom.querySelector("details");
    if (details) {
      //console.log(this.__text, prevNode.__text);
      this.setOpen(details.open);

      const summary = dom.querySelector("summary");
      let len = summary.innerText.length;
      if (len > 80) {
        len = 80;
      }
      details.innerText = this.__text.substring(len);

      if (summary) {
        details.appendChild(summary);
      }

      //console.log("updating details wihth text:", this.__text);
    }
    //}
    return false;
  }

  setText(text: string): void {
    const writable = this.getWritable();
    writable.__text = text;
  }

  getText(): string {
    const self = this.getLatest();
    return self.__text;
  }

  getTextContent(): string {
    return this.getText();
  }

  setOpen(open: boolean): void {
    const writable = this.getWritable();
    writable.__open = open;
  }

  getOpen(): string {
    const self = this.getLatest();
    return self.__open;
  }
  /* 
  decorate(editor: LexicalEditor): ReactNode {
    return <Foldable text={this.__text} />;
  } */

  exportJSON(): SerializedTextNode & { open: boolean } {
    return {
      text: this.__text,
      open: this.__open,
      type: "Foldable",
      version: 1,
      format: 0,
      style: "normal",
      detail: 0,
      mode: "normal",
    };
  }

  isParentRequired(): boolean {
    return false;
  }

  static importJSON(serialized): FoldableNode {
    return $createFoldableNode(serialized.text, serialized.open);
  }
}

export function $createFoldableNode(text: string, open: boolean): FoldableNode {
  return new FoldableNode(text, open);
}

export function $isFoldableNode(node: LexicalNode | null): boolean {
  return node instanceof FoldableNode;
}

// Create a custom command with a typed payload.
type CommandPayload = string;
export const INSERT_FOLDABLE_COMMAND: LexicalCommand<CommandPayload> =
  createCommand("INSERT_FOLDABLE_COMMAND");
const HELLO_WORLD_COMMAND: LexicalCommand<string> = createCommand();

export function FoldablePlugin({ dispatch }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Similar with command listener, which returns unlisten callback
    const removeListener = editor.registerCommand(
      INSERT_FOLDABLE_COMMAND,
      (payload) => {
        // Adding custom command that will be handled by this plugin
        editor.update(() => {
          // Read the contents of the EditorState here.
          const root = $getRoot();
          const selection = $getSelection() as RangeSelection;

          //const text = root.getTextContent();

          let start = selection.anchor;
          let end = selection.focus;

          if (start.type === "text" && end.type === "text") {
            /*   if (parseInt(start.key) > parseInt(end.key)) {
              const foo = start;
              start = end;
              end = foo;
            } else */ if (parseInt(start.key) === parseInt(end.key)) {
              if (start.offset > end.offset) {
                const foo = start;
                start = end;
                end = foo;
              }
            }
          }

          console.log({ selection });
          console.log({ start, end });

          const nodes = selection.getNodes();
          /* console.log({ snodes });

          const nodes = root
            .getChildren()
            .filter(
              (node) => node.getKey() >= start.key && node.getKey() <= end.key
            );
 */
          console.log({ nodes });

          if (nodes.length === 0) return;

          let nodeText = "";
          if (nodes.length === 1) {
            if (start.offset === end.offset) {
              nodeText = nodes[0].getTextContent();
            } else {
              const begin = Math.min(start.offset, end.offset);
              const fin = Math.max(start.offset, end.offset);
              nodeText = nodes[0].getTextContent().slice(begin, fin);
            }
          } else {
            nodeText = nodes
              .map((n, i) => {
                if (i === 0) {
                  const endpoint = pickEndpoint(n, start, end);
                  console.log("first", n.getTextContent(), endpoint.offset);
                  if (endpoint.type === "text") {
                    return getText(n, endpoint.offset);
                  } else {
                    return getText(n);
                  }
                } else if (i === nodes.length - 1) {
                  const endpoint = pickEndpoint(n, start, end);
                  console.log("last", n.getTextContent(), endpoint.offset);
                  if (endpoint.type === "text") {
                    return getText(n, null, endpoint.offset);
                  } else {
                    return getText(n);
                  }
                } else {
                  return getText(n);
                }
              })
              .filter((n) => n !== "")
              .join("\n");
          }
          console.log(nodeText);
          /*    let word;
          if (start.offset < end.offset) {
            word = nodeText.slice(start.offset, end.offset).trim();
          } else {
            word = nodeText.slice(end.offset, start.offset).trim();
          } */
          const fold = $createFoldableNode(nodeText, false);
          const parent = nodes[0].getParent();
          if (nodes.includes(parent)) {
            // If the parent is part of the list of notes we are about to delete,
            // And we attach the new foldable node to the parent, it will just get deleted.
            // So in that case, attach it as a sibling to the parent.
            parent.insertAfter(fold);
            const para = $createParagraphNode();
            const textNode = $createTextNode("");
            para.append(textNode);
            parent.insertAfter(para);
          } else {
            nodes[0].insertAfter(fold);
          }
          //if (nodes.length > 1) {
          nodes.forEach((n, i) => {
            if (i === 0 || i === nodes.length - 1) {
              const endpoint = pickEndpoint(n, start, end);
              if (endpoint.type === "text" && $isTextNode(n)) {
                let newText;
                if (i === 0) {
                  newText = getText(n, 0, endpoint.offset);
                } else {
                  newText = getText(n, endpoint.offset);
                }
                console.log("newText", newText);
                n.setTextContent(newText);
              } else {
                n.remove();
              }
            } else {
              n.remove();
            }
          });

          const state = editor.getEditorState();
          const text = root.getTextContent();

          const json = JSON.stringify(state);

          dispatch({ type: "SET_SAVED", payload: false });
          dispatch({
            type: "SET_CONTENTS",
            payload: text,
          });
          dispatch({
            type: "SET_TEXT",
            payload: json,
          });
          /*} else {
            const text = nodes[0].getTextContent();
            nodes[0].setTextContent(text.replace(nodeText, ""));
          }*/
        });

        // Returning true indicates that command is handled and no further propagation is required
        return true;
      },
      0
    );

    return () => {
      removeListener();
    };
  }, [editor]);

  /* editor.registerNodeTransform(TextNode, (node) => {
    const text = node.getTextContent();

    if (text.match(/^> (.+)\n$/) && !$isFoldableNode(node)) {
      const fold = $createFoldableNode(text.slice(2, text.length));
      const root = $getRoot();
      node.replace(fold);
      //root.append(fold);
    }
  });
 */

  /*  editor.registerCommand(
    KEY_ENTER_COMMAND,
    (event: KeyboardEvent) => {
      editor.update(() => {
        // Read the contents of the EditorState here.
        const root = $getRoot();
        const selection = $getSelection() as RangeSelection;
        console.log({ selection });
        if (!selection) return;
        const current = $getNodeByKey(selection.anchor.key);
        let prev = current.getPreviousSibling();

        if (!prev) {
          const parent = current.getParent();
          if ($isParagraphNode(parent)) {
            prev = parent;
          }
        }
        if (!prev) return;
        console.log({ current, prev });
        const prevPrev = prev.getPreviousSibling();

        const text = current.getTextContent();
        console.log({ current, prev, prevPrev, text });
        if ($isTextNode(current) && text.match(FOLDABLE_REGEX)) {
          console.log("match");
          if (
            ($isLineBreakNode(prev) || $isParagraphNode(prev)) &&
            $isFoldableNode(prevPrev)
          ) {
            const newText =
              prevPrev.getText() + "\n" + text.slice(2, text.length);
            console.log({ newText });
            prevPrev.setText(newText);
            prevPrev.setOpen(true);
            current.remove();
            prev.remove();
          } else if ($isFoldableNode(prev)) {
            const newText = prev.getText() + "\n" + text.slice(2, text.length);
            console.log({ newText });
            prev.setText(newText);
            prev.setOpen(true);
            current.remove();
          } else {
            const fold = $createFoldableNode(text.slice(2, text.length), false);
            current.insertAfter(fold);
            const para = $createParagraphNode();
            const textNode = $createTextNode("");
            para.append(textNode);
            fold.insertAfter(para);
            current.remove();
            textNode.select();
          }
        }
 
      });
      return false;
    },
    COMMAND_PRIORITY_LOW
  ); */

  // When collapsible is the last child pressing down arrow will insert paragraph
  // below it to allow adding more content. It's similar what $insertBlockNode
  // (mainly for decorators), except it'll always be possible to continue adding
  // new content even if trailing paragraph is accidentally deleted
  editor.registerCommand(
    KEY_ARROW_DOWN_COMMAND,
    () => {
      const selection = $getSelection();

      if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
        return false;
      }

      const container = $findMatchingParent(
        selection.anchor.getNode(),
        $isFoldableNode
      );

      if (container === null) {
        return false;
      }

      const parent = container.getParent();
      if (parent !== null && parent.getLastChild() === container) {
        parent.append($createParagraphNode());
      }
      return false;
    },
    COMMAND_PRIORITY_LOW
  ),
    /*  editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      (event: KeyboardEvent) => {
        editor.update(() => {
          // Read the contents of the EditorState here.
          const root = $getRoot();
          const selection = $getSelection() as RangeSelection;
          if (!selection) return;

          if (!$isRangeSelection(selection) || selection.anchor.offset !== 0) {
            return false;
          }

          const current = $getNodeByKey(selection.anchor.key);
          if (!current) return;
          const prev = current.getPreviousSibling();
          console.log({ current, selection, prev });
          if ($isFoldableNode(current)) {
            const text = current.getText();
            const para = $createParagraphNode();
            const node = $createTextNode(text);
            para.append(node);
            current.insertAfter(para);
            current.remove();
            node.select();
          } /*  else if ($isFoldableNode(prev)) {
            const text = prev.getText();
            const para = $createParagraphNode();
            const node = $createTextNode(text);
            para.append(node);
            current.insertAfter(para);
            current.remove();
            prev.remove();
          } */
    /* 
        console.log($isLineBreakNode(current));
        console.log($isFoldableNode(current.getPreviousSibling()));
 */
    /* const start = selection.anchor;
        const end = selection.focus; */
    /* });
        return false;
      },
      COMMAND_PRIORITY_LOW
    );
 */
    editor.registerCommand(
      KEY_MODIFIER_COMMAND,
      (event: KeyboardEvent) => {
        if (event.code === "Period") {
          event.preventDefault();
          editor.dispatchCommand(INSERT_FOLDABLE_COMMAND, null);

          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_LOW
    );

  /* const removeMutationListener = editor.registerMutationListener(
    FoldableNode,
    (mutatedNodes) => {
      console.log("==mutation listener==");
      // mutatedNodes is a Map where each key is the NodeKey, and the value is the state of mutation.
      for (let [nodeKey, mutation] of mutatedNodes) {
        console.log(nodeKey, mutation);
      }
    }
  );
 */

  /* editor.update(() => {
  const textNode = $getNodeByKey('3');
  textNode.setTextContent('foo');
 
});*/

  const handleClick = (event) => {
    if (!event.target) return;
    const key = event.target.getAttribute("data-key");
    if (!key) return;
    editor.update(() => {
      const node = $getNodeByKey(key);
      if (!node) return;
      console.log(node);

      if ($isFoldableNode(node)) {
        const text = node.getText();
        const para = $createParagraphNode();
        const textNode = $createTextNode(text);
        para.append(textNode);
        node.insertAfter(para);
        node.remove();
        textNode.select();
      }
    });
  };

  useEffect(() => {
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [handleClick]);

  return null;
}

function getText(node: any, start = null, end = null) {
  if ($isLineBreakNode(node)) return "";
  if (!$isTextNode(node)) return "";
  const text = node.getTextContent();
  if (start === null && end === null) return text;
  if (start === null) return text.slice(0, end);
  if (end === null) return text.slice(start);
  return text.slice(start, end);
}

function pickEndpoint(n, start, end) {
  let key = n.__key;
  if (key === start.key) {
    return start;
  } else if (key === end.key) {
    return end;
  }
  // maybe it's the parent key?
  key = n.__parent;
  if (key === start.key) {
    return start;
  } else if (key === end.key) {
    return end;
  }

  throw new Error(
    "key not found, " + JSON.stringify({ key, s: start.key, e: end.key })
  );
}
