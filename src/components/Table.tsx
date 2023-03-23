import React from "react";
type TableRow = [string, string];
export default function Table({ rows }: { rows: TableRow[] }) {
  return (
    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
      <table className="min-w-full divide-y divide-gray-300">
        <tbody className="divide-y divide-gray-200 bg-white">
          {rows.map((row, i) => (
            <tr key={i}>
              <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm text-gray-500 sm:pl-0">
                {row[0]}
              </td>
              <td className="whitespace-nowrap px-2 py-2 text-sm font-medium text-gray-900">
                {row[1]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
