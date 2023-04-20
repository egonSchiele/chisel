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
} from "lexical";
import React, { ReactNode, useCallback, useEffect, useState } from "react";
import { BoldTextNode, $createBoldTextNode } from "./BoldTextPlugin";

function Foldable({ text }) {
  const [open, setOpen] = useState(true);
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

export class FoldableNode extends DecoratorNode<any> {
  __text: string;

  static getType(): string {
    return "Foldable";
  }

  static clone(node: FoldableNode): FoldableNode {
    return new FoldableNode(node.__text, node.__key);
  }

  constructor(text: string, key?: NodeKey) {
    super(key);
    this.__text = text;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement("div");
    div.style.display = "contents";
    return div;
  }

  updateDOM(): false {
    return false;
  }

  setText(text: string): void {
    const writable = this.getWritable();
    writable.__text = text;
  }

  decorate(editor: LexicalEditor): ReactNode {
    return <Foldable text={this.__text} />;
  }

  exportJSON(): SerializedLexicalNode & { text: string } {
    return {
      text: this.__text,
      type: "Foldable",
      version: 1,
    };
  }

  static importJSON(serialized): FoldableNode {
    return $createFoldableNode(serialized.text);
  }
}

export function $createFoldableNode(text: string): FoldableNode {
  return new FoldableNode(text);
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

          $insertNodes([$createFoldableNode(word)]);
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
    console.log(text, "prevtext");

    if (text.match(/^> (.+)$/) && !$isFoldableNode(prev)) {
      console.log("in");
      const fold = $createFoldableNode(text.slice(2, text.length));
      const root = $getRoot();
      prev.replace(fold);
      //root.append(fold);
    }
  });

  /* editor.update(() => {
  const textNode = $getNodeByKey('3');
  textNode.setTextContent('foo');
 
});*/

  return null;
}
