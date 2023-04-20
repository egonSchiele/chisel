import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalTextEntity } from "@lexical/react/useLexicalTextEntity";
import {
  $createParagraphNode,
  $createTextNode,
  ParagraphNode,
  SerializedTextNode,
  TextNode,
} from "lexical";
import React, { createElement, useCallback, useEffect } from "react";

export class BoldTextNode extends TextNode {
  __className;

  static getType() {
    return "BoldText";
  }

  static clone(node) {
    return new BoldTextNode(node.__text, node.__key);
  }

  createDOM(config) {
    const dom = super.createDOM(config);
    dom.className = "font-bold";
    /*     dom.style.fontWeight = "bold";
    const elem = document.createElement("div");
    elem.className = this.__className;
    elem.innerText = this.__text;
 */
    return dom;
  }

  exportJSON(): SerializedTextNode & { text: string } {
    return {
      type: BoldTextNode.getType(),
      version: 1,
      text: this.__text,
      detail: this.__detail,
      format: this.__format,
      style: this.__style,
      mode: "normal",
    };
  }
}

export function $isBoldTextNode(node) {
  return node instanceof BoldTextNode;
}

export function $createBoldTextNode(text) {
  return new BoldTextNode(text, null);
}

export default function BoldTextPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([BoldTextNode])) {
      throw new Error("BoldTextPlugin: BoldTextNode not registered on editor");
    }
  }, [editor]);

  const createBoldTextNode = useCallback(
    (textNode: TextNode): BoldTextNode =>
      $createBoldTextNode(textNode.getTextContent()),
    []
  );

  const getBoldTextMatch = useCallback((text: string) => {
    const REGEX = /\*([^*]+)\*/g;
    const matchArr = REGEX.exec(text);

    if (matchArr === null) {
      return null;
    }

    const BoldTextLength = matchArr[0].length + 1;
    const startOffset = matchArr.index;
    const endOffset = startOffset + BoldTextLength;
    return {
      end: endOffset,
      start: startOffset,
    };
  }, []);

  useLexicalTextEntity<BoldTextNode>(
    getBoldTextMatch,
    BoldTextNode,
    createBoldTextNode
  );

  return null;
}
