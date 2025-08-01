// TODO: get type from db schema
// import { Product as ProductType } from "@prisma/client";
// export type Product = ProductType;

export interface Product {
  id: string;
  title: string;
}

export interface CartItem extends Product {
  qty?: number;
}

export interface ShippingDetails {
  addressLine?: string;
}

export interface CartSlice {
  cart: CartItem[];
  addToCart: (product: Product) => void;
}
