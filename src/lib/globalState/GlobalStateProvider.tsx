"use client";

import type { StoreApi } from "zustand";
import { createContext, useContext } from "react";
import { createStore, useStore } from "zustand";

import type { StoreState } from "./slices";
import { createCartSlice } from "./slices/cartSlice";

export const zustandStore = createStore<StoreState>()((set, get, store) => ({
  ...createCartSlice(set, get, store),
}));

const StoreContext = createContext<StoreApi<StoreState> | null>(zustandStore);

export function ZustandProvider({ children }: { children: React.ReactNode }) {
  return (
    <StoreContext.Provider value={zustandStore}>
      {children}
    </StoreContext.Provider>
  );
}

export function useAppStore<T>(selector: (state: StoreState) => T): T {
  const store = useContext(StoreContext);

  if (!store) {
    throw new Error("useAppStore must be used within ZustandProvider");
  }

  return useStore(store, selector);
}
