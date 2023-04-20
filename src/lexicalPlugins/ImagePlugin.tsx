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
} from "lexical";
import React, { ReactNode, useEffect } from "react";
import { node } from "webpack";

function Foo({ url }) {
  return <img src={url} />;
}

export class ImageNode extends DecoratorNode<any> {
  __url: string;

  static getType(): string {
    return "Image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__url, node.__key);
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
    return <Foo url={this.__url} />;
  }
}

export function $createImageNode(url: string): ImageNode {
  return new ImageNode(url);
}

export function $isImageNode(node: LexicalNode | null): boolean {
  return node instanceof ImageNode;
}

// Create a custom command with a typed payload.
type CommandPayload = string;
export const INSERT_IMAGE_COMMAND: LexicalCommand<CommandPayload> =
  createCommand("INSERT_IMAGE_COMMAND");

export function ImagePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Similar with command listener, which returns unlisten callback
    const removeListener = editor.registerCommand(
      INSERT_IMAGE_COMMAND,
      (payload) => {
        // Adding custom command that will be handled by this plugin
        editor.update(() => {
          console.log("payload: ", payload);
          const url = payload;
          $insertNodes([$createImageNode(url)]);
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
