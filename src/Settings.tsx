import { produce } from "immer";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as t from "./Types";
import Button from "./components/Button";
import Input from "./components/Input";
import Select from "./components/Select";
import Switch from "./components/Switch";
import TextArea from "./components/TextArea";
import { librarySlice } from "./reducers/librarySlice";
import { AppDispatch, RootState } from "./store";
import { useLocalStorage } from "./utils";

function Prompt({ label, text, onLabelChange, onTextChange, onDelete }) {
  return (
    <div className="mb-sm p-3 rounded-md dark:bg-dmsettingspanel bg-gray-200">
      <div className="mb-sm w-full">
        <Input
          name="label"
          title="Button Label"
          value={label}
          className=" w-full"
          onChange={(e) => onLabelChange(e.target.value)}
          selector={`prompt-${label}-label`}
        />
      </div>
      <div className="w-full">
        <TextArea
          name="text"
          title="Prompt"
          value={text}
          className="w-full"
          onChange={(e) => onTextChange(e.target.value)}
          selector={`prompt-${label}-text`}
        />
      </div>
      <Button
        size="small"
        onClick={onDelete}
        style="secondary"
        rounded
        className="mt-sm w-full dark:bg-gray-700 dark:border-gray-700 shadow-none"
        selector={`prompt-${label}-delete-button`}
      >
        Delete
      </Button>
    </div>
  );
}

function Header({ children }) {
  return (
    <h4 className="text-xl font-semibold text-black dark:text-gray-300 mb-xs">
      {children}
    </h4>
  );
}

function Settings({ settings, setSettings, usage, onSave }) {
  const dispatch = useDispatch<AppDispatch>();
  const books: t.Book[] = useSelector(
    (state: RootState) => state.library.books
  );
  const [encryptionPassword, setEncryptionPassword] = useLocalStorage(
    "encryptionPassword",
    { password: "" }
  );
  const [encryptionChanged, setEncryptionChanged] = useState(false);
  const [isEncrypted, setIsEncrypted] = useState(settings.encrypted);
  const [editPassword, setEditPassword] = useState(false);

  const handleChange = (key: keyof t.UserSettings, value: any) => {
    setSettings(
      produce(settings, (draft) => {
        // @ts-ignore
        draft[key] = value;
      })
    );
    dispatch(librarySlice.actions.setSettingsSaved(false));
  };

  const handlePromptChange = (index: number, key: string, value: string) => {
    setSettings(
      produce(settings, (draft) => {
        // @ts-ignore
        draft.prompts[index][key] = value;
      })
    );
    dispatch(librarySlice.actions.setSettingsSaved(false));
  };
  const handleDesignChange = (key: string, value: string | number) => {
    setSettings(
      produce(settings, (draft) => {
        draft.design ||= {};
        // @ts-ignore
        draft.design[key] = value;
      })
    );
    dispatch(librarySlice.actions.setSettingsSaved(false));
  };

  const deletePrompt = (index: number) => {
    setSettings(
      produce(settings, (draft) => {
        // @ts-ignore
        draft.prompts.splice(index, 1);
      })
    );
    dispatch(librarySlice.actions.setSettingsSaved(false));
  };

  const addPrompt = (index: number) => {
    setSettings(
      produce(settings, (draft) => {
        // @ts-ignore
        draft.prompts.push({ label: "NewPrompt", text: "" });
      })
    );
    dispatch(librarySlice.actions.setSettingsSaved(false));
  };

  let monthlyUsage;
  let totalUsage;
  if (usage) {
    const { tokens } = usage.openai_api;
    monthlyUsage = tokens.month.prompt + tokens.month.completion;
    totalUsage = tokens.total.prompt + tokens.total.completion;
  }

  async function confirmEncrypt() {
    handleChange("encrypted", true);
    dispatch(librarySlice.actions.setTriggerSaveAll(true));
  }

  async function confirmDecrypt() {
    handleChange("encrypted", false);
    dispatch(librarySlice.actions.setTriggerSaveAll(true));
  }

  return (
    <form className="grid grid-cols-1 gap-y-sm pb-12">
      <Header>API Settings</Header>
      <Select
        title="Model"
        name="model"
        value={settings.model}
        onChange={(e) => {
          handleChange("model", e.target.value);
        }}
      >
        <option>gpt-3.5-turbo</option>
        {settings.admin && <option>vicuna-13b</option>}
        {settings.admin && <option>ggml-gpt4all-j</option>}
        {settings.admin && <option>llama-7b</option>}
        {settings.admin && <option>stablelm-tuned-alpha-7b</option>}
        {settings.admin && <option>flan-t5-xl</option>}
        {settings.admin && <option>TheBloke/guanaco-65B-HF</option>}
        {settings.admin && <option>gpt2</option>}
        {/*         <option>text-davinci-003</option>
        <option>davinci</option>
 */}{" "}
        <option>curie</option>
      </Select>

      <Input
        title="Max Tokens"
        name="max_tokens"
        value={settings.max_tokens}
        onChange={(e) => handleChange("max_tokens", parseInt(e.target.value))}
      />
      <Input
        title="Num Suggestions"
        name="num_suggestions"
        value={settings.num_suggestions}
        onChange={(e) =>
          handleChange("num_suggestions", parseInt(e.target.value))
        }
      />
      <Input
        title="Your key"
        name="customKey"
        value={settings.customKey}
        onChange={(e) => handleChange("customKey", e.target.value)}
      />
      <Header>Encryption</Header>
      <Switch
        label="Encrypt?"
        enabled={isEncrypted}
        setEnabled={(enabled) => {
          setEncryptionChanged(true);
          setEditPassword(true);
          setIsEncrypted(enabled);
        }}
        divClassName="mt-0"
      />
      {isEncrypted && !editPassword && (
        <Button
          size="small"
          onClick={() => {
            setEditPassword(true);
          }}
          style="primary"
          rounded
          className="mt-0 w-full"
          selector={`editPasswordButton`}
        >
          Edit Password
        </Button>
      )}
      {isEncrypted && editPassword && (
        <>
          {" "}
          <Input
            title="Password"
            name="encryptionPassword"
            type="password"
            value={encryptionPassword?.password || ""}
            onChange={(e) =>
              setEncryptionPassword({ password: e.target.value })
            }
            className="my-0"
          />
          <Button
            size="small"
            onClick={() => {
              setEditPassword(false);
            }}
            style="secondary"
            rounded
            className="mt-0 w-full"
            selector={`editPasswordDoneButton`}
          >
            Done
          </Button>
        </>
      )}
      {encryptionChanged && isEncrypted && (
        <>
          <p className="text-xs text-gray-500">
            Please enter the password above and then click confirm encryption to
            encrypt all of your books. Remember, if you lose the password, we
            will not be able to help you recover your data!
          </p>
          <Button
            size="small"
            onClick={() => {
              confirmEncrypt();
              setEncryptionChanged(false);
            }}
            style="secondary"
            rounded
            className="mt-0 w-full dark:bg-gray-700 dark:border-gray-700 shadow-none"
            selector={`confirmEncryptButton`}
          >
            Confirm Encryption
          </Button>
        </>
      )}

      {encryptionChanged && !isEncrypted && (
        <>
          <p className="text-xs text-gray-500">
            Please confirm by clicking the button below
          </p>
          <Button
            size="small"
            onClick={() => {
              confirmDecrypt();
              setEncryptionChanged(false);
            }}
            style="secondary"
            rounded
            className="mt-0 w-full dark:bg-gray-700 dark:border-gray-700 shadow-none"
            selector={`confirmEncryptButton`}
          >
            Confirm Decryption
          </Button>
        </>
      )}
      <Header>UX</Header>
      <Select
        title="Font"
        name="font"
        value={settings.design ? settings.design.font : "sans-serif"}
        onChange={(e) => handleDesignChange("font", e.target.value)}
      >
        <option value="sans-serif">sans-serif</option>
        <option value="serif">serif</option>
      </Select>

      <Select
        title="Font Size"
        name="fontsize"
        value={settings.design ? settings.design.fontSize : 18}
        onChange={(e) =>
          handleDesignChange("fontSize", parseInt(e.target.value))
        }
      >
        <option value="16">16</option>
        <option value="18">18</option>
        <option value="20">20</option>
        <option value="22">22</option>
      </Select>

      <Select
        title="Theme"
        name="theme"
        value={settings.theme}
        onChange={(e) => {
          handleChange("theme", e.target.value);
        }}
      >
        <option>default</option>
        <option>light</option>
        <option>dark</option>
        {/* <option>solarized</option> */}
      </Select>

      {usage && (
        <div>
          <Header>Usage</Header>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="uppercase ">Monthly:</span> {monthlyUsage} tokens
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="uppercase ">Total:</span> {totalUsage} tokens
          </p>
        </div>
      )}
      <div>
        <Header>Prompts</Header>
        {settings.prompts.map((prompt, i) => (
          <Prompt
            key={i}
            label={prompt.label}
            text={prompt.text}
            onLabelChange={(value) => handlePromptChange(i, "label", value)}
            onTextChange={(value) => handlePromptChange(i, "text", value)}
            onDelete={() => deletePrompt(i)}
          />
        ))}
      </div>
      <Button
        onClick={addPrompt}
        rounded
        className="mt-0"
        selector="sidebar-new-prompt-button"
      >
        New Prompt
      </Button>
    </form>
  );
}

export default Settings;
