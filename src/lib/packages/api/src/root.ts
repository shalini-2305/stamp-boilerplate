import { createTRPCRouter } from "./trpc";
import { authRouter } from "./router/auth";
import { productRouter } from "./router/products";

// TODO: refactor: pluralize key names
export const appRouter = createTRPCRouter({
  auth: authRouter,
  product: productRouter,
});

export type AppRouter = typeof appRouter;
