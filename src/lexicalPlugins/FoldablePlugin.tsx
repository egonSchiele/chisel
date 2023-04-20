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
} from "lexical";
import React, { ReactNode, useCallback, useEffect, useState } from "react";
import { BoldTextNode, $createBoldTextNode } from "./BoldTextPlugin";

function Foldable({ text }) {
  const [open, setOpen] = useState(false);
  let firstLine = text.split("\n")[0];
  if (firstLine.length > 20) {
    firstLine = firstLine.substring(0, 20) + "...";
  }
  let arrowClassname = "w-5 h-5 cursor-pointer mb-xs";

  return (
    <div className="flex">
      {open && (
        <ArrowDownCircleIcon
          className={arrowClassname}
          onClick={() => setOpen(!open)}
        />
      )}
      {!open && (
        <ArrowUpCircleIcon
          className={arrowClassname}
          onClick={() => setOpen(!open)}
        />
      )}

      {open && (
        <div className="p-2 bg-gray-700 text-sm font-mono border-l-2 ml-sm border-red-700 w-full">
          {text}
        </div>
      )}
      {!open && <p className="text-sm flex-grow ml-sm">{firstLine}</p>}
    </div>
  );
}

export class FoldableNode extends ElementNode {
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
    container.className = "flex";
    /*     const button = document.createElement("div");
    button.className = "w-5 h-5 cursor-pointer mb-xs";
    button.innerText = ">";
    container.appendChild(button);
 */ const details = document.createElement("details");
    details.className = "flex-grow bg-gray-700 p-2";

    let firstLine = this.__text.split("\n")[0];
    if (firstLine.length > 20) {
      firstLine = firstLine.substring(0, 20) + "...";
    }

    const summary = document.createElement("summary");
    summary.innerText = firstLine;

    details.innerText = this.__text;
    details.appendChild(summary);
    details.open = this.__open;
    container.appendChild(details);

    console.log("creating details wihth text:", this.__text);

    /*    details.addEventListener("toggle", (event) => {
      this.__open = details.open;
    }); */

    //div.style.display = "contents";
    return container;
  }

  updateDOM(prevNode: FoldableNode, dom: HTMLDetailsElement): false {
    /* if (prevNode.__text === this.__text) {

    } */
    /* const details = dom.querySelector("details");
    if (details) {
      this.setOpen(details.open);
    } */
    return false;
  }

  setText(text: string): void {
    const writable = this.getWritable();
    writable.__text = text;
  }

  getText(): string {
    return this.__text;
  }

  setOpen(open: boolean): void {
    const writable = this.getWritable();
    writable.__open = open;
  }
  /* 
  decorate(editor: LexicalEditor): ReactNode {
    return <Foldable text={this.__text} />;
  } */

  exportJSON(): SerializedElementNode<SerializedLexicalNode> & {
    text: string;
    open: boolean;
  } {
    return {
      text: this.__text,
      open: this.__open,
      type: "Foldable",
      version: 1,
      children: [],
      direction: "ltr",
      format: "start",
      indent: 2,
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

export function FoldablePlugin() {
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

          const text = root.getTextContent();

          const start = selection.anchor;
          const end = selection.focus;

          const node = root
            .getAllTextNodes()
            .find((node) => node.getKey() === start.key);

          if (!node) return;

          const nodeText = node.getTextContent();

          let word;
          if (start.offset < end.offset) {
            word = nodeText.slice(start.offset, end.offset).trim();
          } else {
            word = nodeText.slice(end.offset, start.offset).trim();
          }

          $insertNodes([$createFoldableNode(word, false)]);
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
  editor.registerNodeTransform(LineBreakNode, (node) => {
    const prev = node.getPreviousSibling();
    if (prev && $isFoldableNode(prev)) {
      return;
    }

    const text = prev.getTextContent();

    if (text.match(/^> (.+)$/) && !$isFoldableNode(prev)) {
      const fold = $createFoldableNode(text.slice(2, text.length), false);
      const root = $getRoot();
      prev.replace(fold);
      //root.append(fold);
    }
  });

  editor.registerCommand(
    KEY_BACKSPACE_COMMAND,
    (event: KeyboardEvent) => {
      editor.update(() => {
        // Read the contents of the EditorState here.
        const root = $getRoot();
        const selection = $getSelection() as RangeSelection;
        console.log(selection);
        if (!selection) return;
        const current = $getNodeByKey(selection.anchor.key);
        console.log(current);
        if ($isFoldableNode(current)) {
          const text = "> " + current.getText();
          const para = $createParagraphNode();
          const node = $createTextNode(text);
          para.append(node);
          console.log(para);
          current.insertAfter(para);
          current.remove();
        }
        /* 
        console.log($isLineBreakNode(current));
        console.log($isFoldableNode(current.getPreviousSibling()));
 */
        /* const start = selection.anchor;
        const end = selection.focus; */
      });
      return false;
    },
    COMMAND_PRIORITY_LOW
  );

  /* editor.update(() => {
  const textNode = $getNodeByKey('3');
  textNode.setTextContent('foo');
 
});*/

  return null;
}
