import React from "react";
import { Link } from "react-router-dom";
export default function Sidebar({ children, className = "" }) {
  return (
    <div className={`min-h-full dark:bg-dmsidebar ${className}`}>
      <div className="overflow-y-auto pt-5 pb-4">
        <div className="items-center px-4">
          <Link to="/">
            <h1 className="text-2xl font-semibold text-white">Frisson</h1>
          </Link>
        </div>

        <div className="mt-5 space-y-2 dark:bg-dmsidebar px-3">{children}</div>
      </div>
      {/*         <div className="flex flex-shrink-0 border-t border-gray-200 p-4"> */}
    </div>
  );
}
