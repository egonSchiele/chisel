import * as React from "react";
import * as ReactDOM from "react-dom/client";
import TextEditor from "./src/TextEditor";

function App() {
  return (
    <div className="App">
      <TextEditor />
    </div>
  );
}

export default App;

const domNode = document.getElementById("root");
const root = ReactDOM.createRoot(domNode);
root.render(<App />);
