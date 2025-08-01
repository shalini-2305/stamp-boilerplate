import NextAuth from "next-auth";
import { authConfig } from "./config";

export type { Session } from "next-auth";

const NextAuthConfig = NextAuth(authConfig);

const handlers = NextAuthConfig.handlers;
const auth = NextAuthConfig.auth;
const signIn = NextAuthConfig.signIn;
const signOut = NextAuthConfig.signOut;

export { handlers, auth, signIn, signOut };

export {
  invalidateSessionToken,
  validateToken,
  isSecureContext,
} from "./config";
