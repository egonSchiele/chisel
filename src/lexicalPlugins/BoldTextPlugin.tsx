import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalTextEntity } from "@lexical/react/useLexicalTextEntity";
import {
  $createParagraphNode,
  $createTextNode,
  ParagraphNode,
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

  constructor(text, key) {
    super(text, key);
  }

  createDOM(config) {
    console.log("createDOM", config);
    const dom = super.createDOM(config);
    dom.className = "font-bold";
    /*     dom.style.fontWeight = "bold";
    const elem = document.createElement("div");
    elem.className = this.__className;
    elem.innerText = this.__text;
 */
    return dom;
  }
}

export function $isBoldTextNode(node) {
  return node instanceof BoldTextNode;
}

export function $createBoldTextNode(text) {
  return new BoldTextNode(text, null);
}

function useBoldText(editor) {
  useEffect(() => {
    const removeTransformPara = editor.registerNodeTransform(
      ParagraphNode,
      (node) => {
        console.log("transforming paragraph node", node);
      }
    );
    const removeTransform = editor.registerNodeTransform(TextNode, (node) => {
      const textContent = node.getTextContent();
      console.log(">", node);
      if (node.__key !== "3") return;
      //const regex = /\*([^*]+)\*/g;
      /* const matches = [...textContent.matchAll(regex)];
      if (matches.length === 0) {
        return;
      } */
      if (textContent !== "blue") {
        return;
      }
      console.log("HIIII");
      const para = $createParagraphNode();
      /*       const nodes = node.splitText([2]);
      nodes.forEach((match) => {
        para.append(match);
      })*/ // para.append($createBoldTextNode("font-bold", "green"));
      // Create a new TextNode
      /* const textNode = $createTextNode(textContent);

      // Append the text node to the paragraph
      para.append(textNode);
       */ /* matches.forEach((match) => {
        para.append($createBoldTextNode("font-bold", match[1]));
      }); */
      node.replace(para);
    });
    return () => {
      removeTransform();
      removeTransformPara();
    };
  }, [editor]);
}

export default function BoldTextPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([BoldTextNode])) {
      throw new Error("BoldTextPlugin: BoldTextNode not registered on editor");
    }
  }, [editor]);

  const createBoldTextNode = useCallback((textNode: TextNode): BoldTextNode => {
    return $createBoldTextNode(textNode.getTextContent());
  }, []);

  const getBoldTextMatch = useCallback((text: string) => {
    const REGEX = /\*([^*]+)\*/g;
    const matchArr = REGEX.exec(text);

    if (matchArr === null) {
      return null;
    }

    console.log("matchArr", matchArr);

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
