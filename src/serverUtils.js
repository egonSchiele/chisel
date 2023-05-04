export function toMarkdown(block) {
  if (block.type === "markdown") {
    return block.text;
  } else if (block.type === "code") {
    return "```" + block.language + "\n" + block.text + "\n```";
  } else if (block.type === "plain") {
    return block.text;
    //return block.text.replaceAll("\n", "\n\n");
  }
}

export function chapterToMarkdown(chapter, htmlTags = false) {
  const markdown = chapter.text
    .map((block) => toMarkdown(block))
    .join("\n---\n");
  if (htmlTags) {
    return `<pre>${markdown}</pre>`;
  } else {
    return markdown;
  }
}
