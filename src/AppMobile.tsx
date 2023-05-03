import { Routes, Route } from "react-router-dom";
import React from "react";

import LibraryMobile from "./LibraryMobile";
import Library from "./Library";

export default function AppMobile() {
  return (
    <div>
      <Routes>
        <Route
          path="/book/:bookid/chapter/:chapterid/:textindex"
          element={<Library mobile={true} />}
        />
        <Route
          path="/book/:bookid/chapter/:chapterid"
          element={<Library mobile={true} />}
        />
        <Route path="/book/:bookid" element={<LibraryMobile />} />
        <Route path="/" element={<LibraryMobile />} />
      </Routes>
    </div>
  );
}
