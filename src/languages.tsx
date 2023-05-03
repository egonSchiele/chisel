import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import js from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import haskell from "react-syntax-highlighter/dist/esm/languages/hljs/haskell";
import ruby from "react-syntax-highlighter/dist/esm/languages/hljs/ruby";
import python from "react-syntax-highlighter/dist/esm/languages/hljs/python";
import typescript from "react-syntax-highlighter/dist/esm/languages/hljs/typescript";
import go from "react-syntax-highlighter/dist/esm/languages/hljs/go";
import rust from "react-syntax-highlighter/dist/esm/languages/hljs/rust";
import c from "react-syntax-highlighter/dist/esm/languages/hljs/c";
import java from "react-syntax-highlighter/dist/esm/languages/hljs/java";
import bash from "react-syntax-highlighter/dist/esm/languages/hljs/bash";
import sql from "react-syntax-highlighter/dist/esm/languages/hljs/sql";
import php from "react-syntax-highlighter/dist/esm/languages/hljs/php";
import shell from "react-syntax-highlighter/dist/esm/languages/hljs/shell";
import moonscript from "react-syntax-highlighter/dist/esm/languages/hljs/moonscript";
import csharp from "react-syntax-highlighter/dist/esm/languages/hljs/csharp";
import css from "react-syntax-highlighter/dist/esm/languages/hljs/css";
import kotlin from "react-syntax-highlighter/dist/esm/languages/hljs/kotlin";
import swift from "react-syntax-highlighter/dist/esm/languages/hljs/swift";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import yaml from "react-syntax-highlighter/dist/esm/languages/hljs/yaml";

SyntaxHighlighter.registerLanguage("javascript", js);
SyntaxHighlighter.registerLanguage("haskell", haskell);
SyntaxHighlighter.registerLanguage("ruby", ruby);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("go", go);
SyntaxHighlighter.registerLanguage("rust", rust);
SyntaxHighlighter.registerLanguage("c", c);
SyntaxHighlighter.registerLanguage("java", java);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("sql", sql);
SyntaxHighlighter.registerLanguage("php", php);
SyntaxHighlighter.registerLanguage("shell", shell);
SyntaxHighlighter.registerLanguage("moonscript", moonscript);
SyntaxHighlighter.registerLanguage("csharp", csharp);
SyntaxHighlighter.registerLanguage("css", css);
SyntaxHighlighter.registerLanguage("kotlin", kotlin);
SyntaxHighlighter.registerLanguage("swift", swift);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("yaml", yaml);

export const languages = [
  "javascript",
  "haskell",
  "ruby",
  "python",
  "typescript",
  "go",
  "rust",
  "c",
  "java",
  "bash",
  "sql",
  "php",
  "shell",
  "moonscript",
  "csharp",
  "css",
  "kotlin",
  "swift",
  "json",
  "yaml",
];

export default SyntaxHighlighter;
