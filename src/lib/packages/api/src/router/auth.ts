import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

// import { eq } from "drizzle-orm";

import { invalidateSessionToken } from "@acme/auth";
import { CreateUserSchema } from "@acme/validators";
import { supabase } from "@acme/supabase";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { domainName } from "../util";

export const authRouter = createTRPCRouter({
  signup: publicProcedure
    .input(CreateUserSchema)
    .mutation(async ({ input }) => {
      try {
        // if (input.type === "credentials") {}
        const { email, password: rawPassword, name, full_address } = input;

        if (!rawPassword) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Password is required",
          });
        }

        const normalizedEmail = email.toLowerCase().trim();

        console.log("Signup attempt:", {
          email: normalizedEmail,
          name,
          timestamp: new Date().toISOString(),
        });

        // Simplify: Just attempt the signup
        const { data: signupData, error: signupError } =
          await supabase.auth.signUp({
            email: normalizedEmail,
            password: rawPassword,
            options: {
              emailRedirectTo: `${domainName}/auth/signin`,
              data: {
                full_name: name,
                address: full_address,
              },
            },
          });

        if (signupError) {
          console.error("Supabase signup error:", signupError);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: signupError.message || "Error signing up",
          });
        }

        if (!signupData.user) {
          console.error("Signup data missing user");
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error signing up, user not created",
          });
        }

        const { user: newUser } = signupData;

        console.log("User created successfully:", {
          id: newUser.id,
          email: newUser.email,
        });

        // Simply return the user info - we'll handle sign-in separately
        return {
          id: newUser.id,
          email: newUser.email,
          name: newUser.user_metadata.full_name as string,
          address: newUser.user_metadata.address as string,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          console.error("TRPC Error during signup:", error.message, error.code);
          throw error;
        }

        console.error("Unexpected signup error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred during signup",
        });
      }
    }),

  // Simplified sign-in procedure that just attempts to sign in
  signin: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const { email, password } = input;

        console.log("Attempting to sign in:", {
          email,
          timestamp: new Date().toISOString(),
        });

        // Simply try to sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase(),
          password: password,
        });

        if (error) {
          console.error("Error signing in:", {
            message: error.message,
            status: error.status,
            code: error.code,
          });

          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: error.message || "Failed to authenticate",
          });
        }

        console.log("Successfully signed in:", {
          userId: data.user.id,
          hasSession: !!data.session,
        });

        // Return the session data
        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata.full_name as string,
          supabaseAccessToken: data.session.access_token,
          supabaseRefreshToken: data.session.refresh_token,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error("Unexpected sign-in error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred during authentication",
        });
      }
    }),

  // Keep the existing signOut method
  signOut: protectedProcedure.mutation(async ({ ctx }) => {
    // TODO: add try catch to this method and all router's methods
    if (!ctx.token) return { success: false };
    await supabase.auth.signOut();
    await invalidateSessionToken(ctx.token);
    return { success: true };
  }),
} satisfies TRPCRouterRecord);
