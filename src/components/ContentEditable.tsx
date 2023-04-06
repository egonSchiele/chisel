import React from "react";


const DEFAULT_CLASSES = "focus:outline-none"

export default function ContentEditable({
  value,
  onSubmit,
  className = "",
  nextFocus = null,
}) {
  const [content, setContent] = React.useState(value);
  
  const handleChange = evt => {
    setContent(evt.target.innerHTML);
  }
  
  const handleSubmit = () => {
    onSubmit(content);
  };
  
  const onKeyDown = (evt) => {
    if ((evt.metaKey && evt.code == "KeyS") || evt.key === "Enter") {
      evt.preventDefault();
      onSubmit(content);
      if (nextFocus) {
        nextFocus();
      }
    }
  }
  
  return (
    <div
      className={`${DEFAULT_CLASSES} ${className}`}
      contentEditable={true}
      suppressContentEditableWarning
      onBlur={handleSubmit}
      onKeyDown={onKeyDown}
      onInput={handleChange}
    >
      {value}
    </div>
  )
}