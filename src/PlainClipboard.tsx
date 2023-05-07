import { Quill } from "react-quill";

var Clipboard = Quill.import("modules/clipboard");
var Delta = Quill.import("delta");

export default class PlainClipboard extends Clipboard {
  convert(html = null) {
    //console.log("convert", html);
    if (typeof html === "string") {
      //console.log("its a string");
      this.container.innerHTML = html;
    }
    let text = this.container.innerText;
    //console.log("text", text);
    this.container.innerHTML = "";
    return new Delta().insert(text);
  }
  onPaste(clipboardEvent) {
    //console.log("onPaste", clipboardEvent);
    if (clipboardEvent.defaultPrevented || !this.quill.isEnabled()) return;
    if (!clipboardEvent.clipboardData) return;
    const pastedData = clipboardEvent.clipboardData.getData("Text");
    //console.log("pastedData", pastedData);
    clipboardEvent.preventDefault();
    const range = this.quill.getSelection();
    this.quill.insertText(range.index, pastedData, "user");
    this.quill.setSelection(range.index + pastedData.length);
  }
}
