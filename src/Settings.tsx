import React, { useState, useEffect } from "react";
import { produce } from "immer";

import * as t from "./Types";

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<t.UserSettings>({
    model: "",
    max_tokens: 0,
    num_suggestions: 0,
    theme: "default",
    version_control: false,
  });

  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const response = await fetch("/api/settings", { credentials: "include" });
      const data = await response.json();
      console.log("got settings", data);
      setSettings(data.settings);
      setLoaded(true);
    };

    fetchSettings();
  }, []);

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
  };

  if (!loaded) return <div>Loading...</div>;

  return (
    <form>
      <label>
        Model:
        <select
          value={settings.model}
          onChange={(e) => handleChange("model", e.target.value)}
        >
          {/* List your models here */}
          <option value="model1">Model 1</option>
          <option value="model2">Model 2</option>
        </select>
      </label>
      <label>
        Max Tokens:
        <input
          type="text"
          value={settings.max_tokens}
          onChange={(e) =>
            handleChange("max_tokens", parseInt(e.target.value, 10))
          }
        />
      </label>
      <label>
        Num Suggestions:
        <input
          type="text"
          value={settings.num_suggestions}
          onChange={(e) =>
            handleChange("num_suggestions", parseInt(e.target.value, 10))
          }
        />
      </label>
      <label>
        Theme:
        <select
          value={settings.theme}
          onChange={(e) => handleChange("theme", e.target.value as t.Theme)}
        >
          <option value="default">default</option>
        </select>
      </label>
      <label>
        Version Control:
        <input
          type="checkbox"
          checked={settings.version_control}
          onChange={(e) => handleChange("version_control", e.target.checked)}
        />
      </label>
      <button type="button" onClick={handleSave}>
        Save
      </button>
    </form>
  );
};

export default Settings;
