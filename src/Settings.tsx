import React, { useState, useEffect } from "react";
import { produce } from "immer";
import { PencilIcon, TagIcon } from "@heroicons/react/24/solid";
import Button from "./components/Button";
import Input from "./components/Input";
import Select from "./components/Select";
import * as t from "./Types";
import TextArea from "./components/TextArea";
import { getCsrfToken } from "./utils";

function Prompt({ label, text, onLabelChange, onTextChange, onDelete }) {
  return (
    <div className="mb-sm p-3 rounded-md dark:bg-dmsettingspanel bg-gray-200">
      <div className="mb-sm w-full">
        <Input
          name="label"
          title="Button Label"
          value={label}
          className=" w-full"
          labelClassName="dark:text-black"
          onChange={(e) => onLabelChange(e.target.value)}
          selector={`prompt-${label}-label`}
        />
      </div>
      <div className="w-full">
        <TextArea
          name="text"
          title="Prompt (use {{text}} for input text)"
          value={text}
          className="w-full"
          labelClassName="dark:text-black"
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

function Settings({ settings, setSettings, usage, onSave }) {
  const handleChange = (key: keyof t.UserSettings, value: any) => {
    setSettings(
      produce(settings, (draft) => {
        // @ts-ignore
        draft[key] = value;
      })
    );
  };

  const handlePromptChange = (index: number, key: string, value: string) => {
    setSettings(
      produce(settings, (draft) => {
        // @ts-ignore
        draft.prompts[index][key] = value;
      })
    );
  };

  const deletePrompt = (index: number) => {
    setSettings(
      produce(settings, (draft) => {
        // @ts-ignore
        draft.prompts.splice(index, 1);
      })
    );
  };

  const addPrompt = (index: number) => {
    setSettings(
      produce(settings, (draft) => {
        // @ts-ignore
        draft.prompts.push({ label: "NewPrompt", text: "" });
      })
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await fetch("/api/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ settings, csrfToken: getCsrfToken() }),
    });
    onSave();
  };

  let monthlyUsage;
  let totalUsage;
  if (usage) {
    const { tokens } = usage.openai_api;
    monthlyUsage = tokens.month.prompt + tokens.month.completion;
    totalUsage = tokens.total.prompt + tokens.total.completion;
  }

  return (
    <form className="grid grid-cols-1 gap-y-sm">
      <Select
        title="Model"
        name="model"
        value={settings.model}
        onChange={(e) => handleChange("model", e.target.value)}
      >
        <option>gpt-3.5-turbo</option>
        {/*         <option>text-davinci-003</option>
        <option>davinci</option>
 */}{" "}
        <option>curie</option>
      </Select>

      <Input
        title="Max Tokens"
        name="max_tokens"
        value={settings.max_tokens}
        onChange={(e) => handleChange("max_tokens", e.target.value)}
      />
      <Input
        title="Num Suggestions"
        name="num_suggestions"
        value={settings.num_suggestions}
        onChange={(e) => handleChange("num_suggestions", e.target.value)}
      />

      {usage && (
        <div>
          <h4 className="text-xl font-semibold text-black dark:text-gray-300 mb-xs">
            Usage
          </h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="uppercase ">Monthly:</span> {monthlyUsage} tokens
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="uppercase ">Total:</span> {totalUsage} tokens
          </p>
        </div>
      )}
      {/*  <Select
        title="Theme"
        name="theme"
        value={settings.theme}
        onChange={(e) => handleChange("theme", e.target.value as t.Theme)}
      >
        <option value="default">default</option>
      </Select> */}

      {/*  <label>
        Version Control:
        <input
          type="checkbox"
          checked={settings.version_control}
          onChange={(e) => handleChange("version_control", e.target.checked)}
        />
      </label> */}
      <div>
        <h4 className="text-xl font-semibold text-black dark:text-gray-300 mb-xs mt-sm">
          Prompts
        </h4>
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
      <Button
        onClick={handleSave}
        rounded
        className="mt-0"
        selector="sidebar-save-button"
      >
        Save
      </Button>
    </form>
  );
}

export default Settings;
