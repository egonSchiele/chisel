import * as toolkitRaw from "@reduxjs/toolkit";
import { librarySlice } from "./reducers/librarySlice";

// @ts-ignore
const { configureStore } = toolkitRaw.default ?? toolkitRaw;

export const store = configureStore({
  reducer: {
    library: librarySlice.reducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
