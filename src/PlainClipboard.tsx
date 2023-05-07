import { Quill } from "react-quill";

var Clipboard = Quill.import("modules/clipboard");
var Delta = Quill.import("delta");

export default class PlainClipboard extends Clipboard {
  convert(html = null) {
    if (typeof html === "string") {
      this.container.innerHTML = html;
    }
    let text = this.container.innerText;
    this.container.innerHTML = "";
    return new Delta().insert(text);
  }
  /* onPaste(range, { text }) {
    const delta = new Delta()
      .retain(range.index)
      .delete(range.length)
      .insert(text);
    this.quill.updateContents(delta);
    this.quill.setSelection(delta.length() - range.length);
    this.quill.scrollIntoView();
  } */
}
