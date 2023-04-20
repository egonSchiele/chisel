import {
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
} from "@heroicons/react/24/solid";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { url } from "inspector";
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
} from "lexical";
import React, { ReactNode, useEffect, useState } from "react";
import { node } from "webpack";

function Foldable({ text }) {
  const [open, setOpen] = useState(true);
  const firstLine = text.split("\n")[0];
  return (
    <div>
      {open && (
        <ArrowDownCircleIcon
          className="w-5 h-5 cursor-pointer mb-xs"
          onClick={() => setOpen(!open)}
        />
      )}
      {!open && (
        <ArrowUpCircleIcon
          className="w-5 h-5 cursor-pointer mb-xs"
          onClick={() => setOpen(!open)}
        />
      )}

      {open && <div className="p-2 bg-gray-700 text-sm font-mono">{text}</div>}
      {!open && <div>{firstLine}</div>}
    </div>
  );
}

export class FoldableNode extends DecoratorNode<any> {
  __url: string;

  static getType(): string {
    return "Foldable";
  }

  static clone(node: FoldableNode): FoldableNode {
    return new FoldableNode(node.__url, node.__key);
  }

  constructor(url: string, key?: NodeKey) {
    super(key);
    this.__url = url;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement("div");
    div.style.display = "contents";
    return div;
  }

  updateDOM(): false {
    return false;
  }

  setURL(url: string): void {
    const writable = this.getWritable();
    writable.__url = url;
  }

  decorate(editor: LexicalEditor): ReactNode {
    return <Foldable text={this.__url} />;
  }
}

export function $createFoldableNode(url: string): FoldableNode {
  return new FoldableNode(url);
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

          const url = payload;
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

  return null;
}
