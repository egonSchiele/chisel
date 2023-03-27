import React from "react";
import { Link } from "react-router-dom";
import Button from "./components/Button";
export default function Sidebar({
  children,
  setSettingsOpen,
  bookid,
  className = "",
}) {
  return (
    <div className={`min-h-full bg-sidebar dark:bg-dmsidebar ${className}`}>
      <div className="overflow-y-auto pt-5 pb-4">
        <div className="px-4 flex justify-start">
          <Link to="/" className="">
            <h1 className="text-2xl font-semibold text-black dark:text-white">
              Frisson
            </h1>
          </Link>
          <div className="">
            <Button
              onClick={() => setSettingsOpen(true)}
              rounded={true}
              className="ml-xs"
            >
              Settings
            </Button>
            <Link to={`/book/${bookid}`} className="">
              <Button onClick={() => {}} rounded={true} className="ml-xs">
                Back to book
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-5 space-y-2 dark:bg-dmsidebar px-3">{children}</div>
      </div>
      {/*         <div className="flex flex-shrink-0 border-t border-gray-200 p-4"> */}
    </div>
  );
}
