import type { StateCreator } from "zustand";

import type { CartSlice } from "./cart.type";
import { createCartActions } from "./cartSelectors";

export const createCartSlice: StateCreator<CartSlice> = (set) => ({
  cart: [],
  ...createCartActions(set),
});
