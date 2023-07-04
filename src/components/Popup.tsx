import React, { useState, useEffect } from "react";
import Input from "./Input";
import Button from "./Button";
import { useDispatch } from "react-redux";
import { librarySlice } from "../reducers/librarySlice";
import * as t from "../Types";
import { isString } from "../utils";
import Select from "./Select";
function Popup({
  title,
  inputValue,
  onSubmit,
  options = null,
  cancelable = true,
  opaqueBackground = false,
}: {
  title: string;
  inputValue: string;
  onSubmit: (inputValue: string) => void;
  options?: t.SelectOption[] | null;
  cancelable?: boolean;
  opaqueBackground?: boolean;
}) {
  const [inputValueState, setInputValueState] = useState(inputValue);
  const dispatch = useDispatch();
  const inputRef = React.useRef<HTMLInputElement>(null);
  useEffect(() => {
    setInputValueState(inputValue);
  }, [inputValue]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef.current]);

  const close = () => dispatch(librarySlice.actions.hidePopup());
  const backgroundClass = opaqueBackground
    ? "bg-black bg-opacity-100"
    : "bg-white bg-opacity-20";
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${backgroundClass}`}
    >
      <div className="bg-white border border-gray-300 dark:bg-black dark:border-gray-700 p-4 md:p-6 lg:p-8 w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3 rounded-lg">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(inputValueState);
            close();
          }}
        >
          {options && (
            <Select
              title={title}
              name={title}
              value={inputValueState}
              onChange={(e) => setInputValueState(e.target.value)}
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          )}
          {!options && (
            <Input
              name={title}
              value={inputValueState}
              onChange={(e) => setInputValueState(e.target.value)}
              ref={inputRef}
            />
          )}
        </form>
        <div className="flex justify-end mt-4">
          {cancelable && (
            <Button
              onClick={close}
              className="bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded mr-2"
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={() => {
              onSubmit(inputValueState);
              close();
            }}
            className="bg-blue-500 text-white font-semibold py-2 px-4 rounded"
            selector="popup-ok-button"
          >
            OK
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Popup;
