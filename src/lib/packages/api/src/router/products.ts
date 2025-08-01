import type { TRPCRouterRecord } from "@trpc/server";

// import { desc } from "@acme/db";
import { Products } from "@acme/db/schema";
import { supabase } from "@acme/supabase";

import { createTRPCRouter, publicProcedure } from "../trpc";
import { desc } from "drizzle-orm";

// TODO: rename file to products.ts

export const productRouter = createTRPCRouter({
  all: publicProcedure.query(async ({ ctx }) => {
    // Query products with their related images
    // TODO: query only physical products
    // TODO: when only physical products queried,
    // .. get id via inArray(Products.id, productsId) to get all cart products and only if such validations are necessary
    const products = await ctx.db.query.Products.findMany({
      orderBy: desc(Products.id),
      with: {
        productImages: {
          columns: {
            path: true,
          },
        },
        productDetail: {
          columns: {
            isPhysical: true,
          },
        },
      },
    });

    // Generate signed URLs for each product image
    return await Promise.all(
      products.map(async (product) => ({
        ...product,
        productDetail: {
          isPhysical: product.productDetail?.isPhysical,
        },
        productImages: await Promise.all(
          product.productImages.map(async (image) => {
            // If path is already a URL, use it directly
            if (image.path.startsWith("http")) {
              return { ...image, signedUrl: image.path };
            }

            // Extract the object path from the image path
            const bucketName = "products";
            const pathPrefix = `${bucketName}/`;
            let path = image.path;

            const pathPrefixIndex = path.indexOf(pathPrefix);
            if (pathPrefixIndex !== -1) {
              path = path.substring(pathPrefixIndex + pathPrefix.length);
            }

            // Create signed URL
            const expiryTime = 1 * 60 * 60; // 1 hour expiry
            const { data } = await supabase.storage
              .from("products")
              .createSignedUrl(path, expiryTime);

            return { ...image, signedUrl: data?.signedUrl ?? null };
          }),
        ),
      })),
    );
  }),
} satisfies TRPCRouterRecord);
