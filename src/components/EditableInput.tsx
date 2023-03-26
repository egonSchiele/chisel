import React from "react";
import Button from "./Button";
import Input from "./Input";

export default function EditableInput({
  value,
  onSubmit,
  children,
  className = "",
}) {
  const [inputValue, setInputValue] = React.useState(value);
  const [isEditing, setIsEditing] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  return (
    <div className={className}>
      {isEditing ? (
        <div className="grid grid-cols-5 gap-2 mb-xs">
          <Input
            name="input"
            /* ref={inputRef} */
            value={inputValue}
            className="col-span-4 text-3xl"
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={() => {
              onSubmit(inputValue);
              setIsEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSubmit(inputValue);
                setIsEditing(false);
              }
            }}
          />
          <Button
            onClick={() => {
              onSubmit(inputValue);
              setIsEditing(false);
            }}
            className="ml-2"
          >
            Save
          </Button>
        </div>
      ) : (
        <div onClick={() => setIsEditing(true)}>{children}</div>
      )}
    </div>
  );
}
