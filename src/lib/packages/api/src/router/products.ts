import type { TRPCRouterRecord } from "@trpc/server";
import { Products } from "@acme/db/schema";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { desc } from "drizzle-orm";

// TODO: rename file to products.ts

export const productRouter = createTRPCRouter({
  all: publicProcedure.query(async ({ ctx }) => {
    const products = await ctx.db.query.Products.findMany({
      orderBy: desc(Products.id),
      // with: {
      //   productImages: {
      //     columns: {
      //       path: true,
      //     },
      //   },
      // },
    });

    return products;
  }),
} satisfies TRPCRouterRecord);
