import { env } from "~/env";

// export const defaultDigitalItemPrice = 40;

export const domainName =
  env.NODE_ENV === "production"
    ? "https://x.ascodelabs.com"
    : "http://localhost:3000";
