import React from "react";
import Panel from "./components/Panel";
import Table from "./components/Table";
export default function InfoPanel({ state }) {
  const rows = [];
  if (state.syllables > 0) {
    rows.push(["Syllables", state.syllables.toString()]);
  }

  return (
    <Panel title="Info">
      <Table rows={rows} />
    </Panel>
  );
}
