import React, { useState, useEffect } from "react";
import Input from "./components/Input";
import Button from "./components/Button";
import { useDispatch } from "react-redux";
import { librarySlice } from "./reducers/librarySlice";

function Popup({ title, inputValue, onSubmit }) {
  const [inputValueState, setInputValueState] = useState(inputValue);
  const dispatch = useDispatch();
  useEffect(() => {
    setInputValueState(inputValue);
  }, [inputValue]);

  const close = () => dispatch(librarySlice.actions.hidePopup());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-20">
      <div className="bg-white border border-gray-300 dark:bg-black dark:border-gray-700 p-4 md:p-6 lg:p-8 w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3 rounded-lg">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(inputValueState);
            close();
          }}
        >
          <Input
            name={title}
            value={inputValueState}
            onChange={(e) => setInputValueState(e.target.value)}
          />
        </form>
        <div className="flex justify-end mt-4">
          <Button
            onClick={close}
            className="bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded mr-2"
          >
            Cancel
          </Button>
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
