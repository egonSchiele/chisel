import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createParagraphNode, $createTextNode, TextNode } from "lexical";
import { useEffect } from "react";

export class BoldTextNode extends TextNode {
  __className;

  static getType() {
    return "BoldText";
  }

  static clone(node) {
    return new BoldTextNode(node.__className, node.__text, node.__key);
  }

  constructor(className, text, key) {
    super(text, key);
    this.__className = className;
  }

  createDOM(config) {
    const dom = super.createDOM(config);
    dom.className = this.__className;
    return dom;
  }
}

export function $isBoldTextNode(node) {
  return node instanceof BoldTextNode;
}

export function $createBoldTextNode(className, text) {
  return new BoldTextNode(className, text, null);
}

function useBoldText(editor) {
  useEffect(() => {
    const removeTransform = editor.registerNodeTransform(TextNode, (node) => {
      const textContent = node.getTextContent();
      const regex = /\*([^*]+)\*/g;
      const matches = [...textContent.matchAll(regex)];
      if (matches.length === 0) {
        return;
      }
      const para = $createParagraphNode();

      // Create a new TextNode
      /* const textNode = $createTextNode(textContent);

      // Append the text node to the paragraph
      para.append(textNode);
       */ matches.forEach((match) => {
        para.append($createBoldTextNode("font-bold", match[1]));
      });
      node.replace(para);
    });
    return () => {
      removeTransform();
    };
  }, [editor]);
}

export default function BoldTextPlugin() {
  const [editor] = useLexicalComposerContext();
  useBoldText(editor);
  return null;
}
