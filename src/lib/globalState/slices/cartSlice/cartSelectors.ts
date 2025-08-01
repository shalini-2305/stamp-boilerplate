import type { StoreApi } from "zustand";

import type { CartSlice, Product } from "./cart.type";

// Selectors
export const selectCart = (state: CartSlice) => state.cart;

export const createCartActions = (set: StoreApi<CartSlice>["setState"]) => ({

  addToCart: (
    product: Product
  ) =>
    set((state) => {
      const newCart = [...state.cart, product];

      return {
        ...state,
        cart: newCart,
      };
    }),
});
