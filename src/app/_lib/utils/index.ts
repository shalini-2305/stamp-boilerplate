import { env } from "~/env";

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const domainName =
  env.NODE_ENV === "production"
    ? "https://x.ascodelabs.com"
    : "http://localhost:3000";
