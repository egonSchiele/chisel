import React from "react";
import { Link } from "react-router-dom";
export default function Sidebar({ children }) {
  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      {/* Sidebar component, swap this element with another sidebar if you like */}
      <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
        <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
          <div className="flex flex-shrink-0 items-center px-4">
            <Link to="/">
              <h1 className="text-2xl font-semibold text-gray-900">Frisson</h1>
            </Link>
          </div>

          <div className="mt-5 flex-1 space-y-1 bg-white px-2">{children}</div>
        </div>
        {/*         <div className="flex flex-shrink-0 border-t border-gray-200 p-4"> */}
      </div>
    </div>
  );
}
