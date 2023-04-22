import React from "react";

function Sidebar() {
  return <div>sidebar.</div>;
}

function MainContent() {
  return (
    <div>
      <h1 className="text-3xl antialiased mb-md font-bold">
        Chisel User Guide
      </h1>
      <h3 className="text-xl antialiased  mb-sm font-bold dark:text-gray-300 text-gray-700">
        Features
      </h3>
    </div>
  );
}

export default function UserGuide() {
  return (
    <div className="flex m-md mt-xl">
      <div className="max-w-48 flex-none">
        <Sidebar />
      </div>
      <div className="flex-grow">
        <MainContent />
      </div>
    </div>
  );
}
