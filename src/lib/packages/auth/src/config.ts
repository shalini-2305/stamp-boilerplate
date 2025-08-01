import type {
  DefaultSession,
  NextAuthConfig,
  Session as NextAuthSession,
} from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Credentials from "next-auth/providers/credentials";

import type {
  AuthError,
  Session as SupabaseSession,
  User as SupabaseUser,
} from "@acme/supabase";
import { db } from "@acme/db/client";
import { SigninSchema } from "@acme/validators";
import { supabase } from "@acme/supabase";

import { env } from "../env";

declare module "next-auth" {
  interface User {
    password?: string;
    supabaseAccessToken?: string;
    supabaseRefreshToken?: string;
  }
  interface Session {
    user: {
      id: string;
      supabaseAccessToken?: string;
      supabaseRefreshToken?: string;
    } & DefaultSession["user"];
  }
}

const adapter = DrizzleAdapter(db);

const thirtyDays = 30 * 24 * 60 * 60;

export const isSecureContext = true;
export const authConfig = {
  adapter,
  secret: env.AUTH_SECRET || "fallback-secret-for-development",
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        supabaseAccessToken: { label: "Access Token", type: "text" },
        supabaseRefreshToken: { label: "Refresh Token", type: "text" },
      },
      async authorize(credentials) {
        try {
          // First check if we have tokens provided directly (from signup)
          if (
            credentials.supabaseAccessToken &&
            credentials.supabaseRefreshToken
          ) {
            console.log("Using provided Supabase tokens for authorization");

            try {
              // Set the session first before validating
              const { data: setSessionData, error: setSessionError } =
                await supabase.auth.setSession({
                  access_token: credentials.supabaseAccessToken as string,
                  refresh_token: credentials.supabaseRefreshToken as string,
                });

              if (setSessionError) {
                console.warn(
                  "Error setting session with provided tokens:",
                  setSessionError,
                );
                // Fall back to normal signin
              } else if (setSessionData.user) {
                // Tokens are valid, create NextAuth user
                return {
                  id: setSessionData.user.id,
                  email: setSessionData.user.email,
                  name: setSessionData.user.user_metadata.full_name as string,
                  supabaseAccessToken:
                    credentials.supabaseAccessToken as string,
                  supabaseRefreshToken:
                    credentials.supabaseRefreshToken as string,
                };
              }
            } catch (tokenError) {
              console.warn("Error verifying provided tokens:", tokenError);
              // Fall back to normal signin
            }
          }

          // Normal credential flow if no tokens or token verification failed
          if (!credentials.email || !credentials.password) {
            console.warn("Missing email or password in credentials");
            return null;
          }

          const parsedCredentials = SigninSchema.safeParse({
            email: credentials.email,
            password: credentials.password,
          });

          if (!parsedCredentials.success) {
            console.warn(
              "Invalid credentials format:",
              parsedCredentials.error.issues,
            );
            return null;
          }

          const { email, password } = parsedCredentials.data;

          console.log(
            "Attempting Supabase authentication for email:",
            email.toLowerCase(),
          );

          interface ResSupabaseSignin {
            data: { user: SupabaseUser; session: SupabaseSession } | null;
            error: AuthError | null;
          }

          const { data: signinData, error: signinError } =
            (await supabase.auth.signInWithPassword({
              email: email.toLowerCase(),
              password: password,
            })) as ResSupabaseSignin;

          if (signinError) {
            console.warn(
              `Supabase authentication failed: ${signinError.message}`,
              {
                code: signinError.code,
                status: signinError.status,
              },
            );
            return null;
          }

          if (!signinData?.user || !signinData?.session) {
            console.warn("No signin data or session found from Supabase");
            return null;
          }

          const { user, session } = signinData;

          console.log("Supabase authentication successful for user:", user.id);

          // Create or update the NextAuth session with Supabase data
          const nextAuthUser = {
            id: user.id,
            email: user.email,
            name: user.user_metadata.full_name as string,
            // Add Supabase session data that you want to persist
            supabaseAccessToken: session.access_token,
            supabaseRefreshToken: session.refresh_token,
          };

          return nextAuthUser;
        } catch (error) {
          console.error("Authorization error:", error);

          // Handle different types of errors more specifically
          // To prevent unnecessary 'Invalid Credentials' error
          if (error && typeof error === "object") {
            // Handle Supabase-specific errors
            if ("code" in error && "message" in error) {
              const supabaseError = error as AuthError;

              // Network/connectivity errors - don't treat as invalid credentials
              if (
                supabaseError.code === "network_error" ||
                supabaseError.message?.includes("network") ||
                supabaseError.message?.includes("fetch")
              ) {
                console.warn(
                  "Network error during authentication:",
                  supabaseError.message,
                );
                throw new Error(
                  "Unable to connect to authentication service. Please check your internet connection and try again.",
                );
              }

              // Rate limiting errors
              if (
                supabaseError.code === "too_many_requests" ||
                supabaseError.message?.includes("rate limit")
              ) {
                console.warn("Rate limit exceeded:", supabaseError.message);
                throw new Error(
                  "Too many login attempts. Please wait a moment and try again.",
                );
              }

              // Server errors - don't treat as invalid credentials
              if (
                supabaseError.code === "internal_server_error" ||
                supabaseError.message?.includes("500") ||
                supabaseError.message?.includes("server error")
              ) {
                console.warn(
                  "Server error during authentication:",
                  supabaseError.message,
                );
                throw new Error(
                  "Authentication service is temporarily unavailable. Please try again later.",
                );
              }

              // Invalid credentials (actual authentication failures)
              if (
                supabaseError.code === "invalid_credentials" ||
                supabaseError.code === "email_not_confirmed" ||
                supabaseError.code === "invalid_grant" ||
                supabaseError.message?.includes("invalid login credentials") ||
                supabaseError.message?.includes("Email not confirmed")
              ) {
                console.warn(
                  "Invalid credentials provided:",
                  supabaseError.message,
                );
                return null; // This will properly trigger "invalid credentials" in the UI
              }
            }

            // Handle other error types
            if ("name" in error) {
              const namedError = error as Error;

              // Network/fetch errors
              if (
                namedError.name === "TypeError" &&
                namedError.message?.includes("fetch")
              ) {
                console.warn("Network fetch error:", namedError.message);
                throw new Error(
                  "Unable to connect to authentication service. Please check your internet connection and try again.",
                );
              }

              // Timeout errors
              if (
                namedError.name === "TimeoutError" ||
                namedError.message?.includes("timeout")
              ) {
                console.warn(
                  "Timeout error during authentication:",
                  namedError.message,
                );
                throw new Error(
                  "Authentication request timed out. Please try again.",
                );
              }
            }
          }

          // For any other unexpected errors, don't treat as invalid credentials
          console.error("Unexpected error during authorization:", error);
          throw new Error(
            "An unexpected error occurred during authentication. Please try again.",
          );
        }
      },
    }),
  ],

  debug: true,
  jwt: {
    maxAge: thirtyDays,
  },
  session: {
    strategy: "jwt",
    maxAge: thirtyDays,
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    jwt: (opts) => {
      const { token, user } = opts;
      // console.log(`# callback jwt token: `, objKeyStringify(token));
      // console.log(`# callback jwt user: `, objKeyStringify(user));

      if (!("user" in opts)) return token;

      return {
        ...token,
        id: user.id,
        email: user.email,
        name: user.name,
        supabaseAccessToken: user.supabaseAccessToken,
        supabaseRefreshToken: user.supabaseRefreshToken,
      };
    },
    session: (opts) => {
      const { session, token } = opts;
      // console.log(`# callback session session: `, objKeyStringify(session));
      // console.log(`# callback session session values: `, session);
      // console.log(`# callback session token: `, objKeyStringify(token));
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          email: token.email,
          name: token.name,
          supabaseAccessToken: token.supabaseAccessToken as string | undefined,
          supabaseRefreshToken: token.supabaseRefreshToken as
            | string
            | undefined,
        },
      };
    },
  },
} satisfies NextAuthConfig;

export const validateToken = async (
  token: string,
): Promise<NextAuthSession | null> => {
  try {
    // const sessionToken = token.slice("Bearer ".length);

    console.log(`token: `, token);
    // Use Supabase directly to validate the session
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.warn("Supabase session error:", error.message);
      return null;
    }

    if (!data.session) {
      console.warn("No valid Supabase session found");
      return null;
    }

    const expiresAt = (data.session.expires_at ?? 0) * 1000;

    return {
      user: {
        id: data.session.user.id,
        email: data.session.user.email ?? "",
        name: data.session.user.user_metadata.full_name as string,
      },
      expires: new Date(expiresAt).toISOString(),
    };
  } catch (error) {
    console.error("Token validation error:", error);
    return null;
  }
};

export const invalidateSessionToken = async (token: string) => {
  // Use Supabase signout instead of adapter's deleteSession
  console.log(`token: `, token);
  await supabase.auth.signOut();
};
