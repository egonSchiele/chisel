import React from "react";
type TableRow = [string, string];
export default function Table({ rows }: { rows: TableRow[] }) {
  return (
    <div className="min-w-full align-middle">
      <table className="min-w-full divide-y divide-gray-300">
        <tbody className="divide-y divide-gray-200 px-2 py-2">
          {rows.map((row, i) => (
            <tr key={i}>
              <td className="py-2 px-2 text-sm text-gray-500">{row[0]}</td>
              <td className="px-2 py-2 text-sm font-medium text-gray-900">
                {row[1]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
