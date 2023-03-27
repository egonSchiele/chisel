import React, { useState, useEffect } from "react";
import { produce } from "immer";
import Button from "./components/Button";
import Input from "./components/Input";
import Select from "./components/Select";
import * as t from "./Types";

const Settings = ({ settings, setSettings, onSave }) => {
  const handleChange = (key: keyof t.UserSettings, value: any) => {
    setSettings(
      produce(settings, (draft) => {
        // @ts-ignore
        draft[key] = value;
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
      body: JSON.stringify({ settings }),
    });
    onSave();
  };

  return (
    <form className="grid grid-cols-1 gap-y-sm">
      <Select
        title="Model"
        name="model"
        value={settings.model}
        onChange={(e) => handleChange("model", e.target.value)}
      >
        <option>gpt-3.5-turbo</option>
        <option>text-davinci-003</option>
        <option>davinci</option>
        <option>curie</option>
      </Select>

      <Input
        title="Max Tokens"
        name="max_tokens"
        value={settings.max_tokens}
        onChange={(e) =>
          handleChange("max_tokens", parseInt(e.target.value, 10))
        }
      />
      <Input
        title="Num Suggestions"
        name="num_suggestions"
        value={settings.num_suggestions}
        onChange={(e) =>
          handleChange("num_suggestions", parseInt(e.target.value, 10))
        }
      />

      <Select
        title="Theme"
        name="theme"
        value={settings.theme}
        onChange={(e) => handleChange("theme", e.target.value as t.Theme)}
      >
        <option value="default">default</option>
      </Select>

      {/*  <label>
        Version Control:
        <input
          type="checkbox"
          checked={settings.version_control}
          onChange={(e) => handleChange("version_control", e.target.checked)}
        />
      </label> */}
      <Button onClick={handleSave} rounded={true} className="mt-sm">
        Save
      </Button>
    </form>
  );
};

export default Settings;
