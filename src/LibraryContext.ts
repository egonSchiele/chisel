import { createContext } from "react";
import * as t from "./Types";
const LibraryContext = createContext<t.LibraryContextType | null>(null);
export default LibraryContext;
