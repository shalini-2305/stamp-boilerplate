"use client";

import type { z } from "zod";
import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

// import EyeSlashIcon from "@acme/assets/src/images/icons/eye-slash.svg";
// import EyeIcon from "@acme/assets/src/images/icons/eye.svg";
import { SigninSchema } from "@acme/validators";
import { Button } from "@acme/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@acme/ui/form";
import { Input } from "@acme/ui/input";
import { toast } from "@acme/ui/toast";

import styles from "./signinForm.module.css";
import { Mail, Stamp, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

// import { api } from "~/trpc/react";

// type SigninFormSchema = z.infer<typeof SigninSchema>;

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const form = useForm({
    schema: SigninSchema,
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [showPassword, setShowPassword] = React.useState(false);

  const handleSignIn = async (data: z.infer<typeof SigninSchema>) => {
    try {
      console.log("Attempting signin with data:", { email: data.email });

      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      console.log("SignIn result:", result);

      if (result?.error) {
        console.error("SignIn error:", result.error);

        // Provide more specific error messages
        if (result.error === "CredentialsSignin") {
          toast.error(
            "Invalid email or password. Please check your credentials and try again.",
          );
        } else if (result.error === "Configuration") {
          toast.error(
            "Authentication service configuration error. Please contact support.",
          );
        } else if (result.error === "AccessDenied") {
          toast.error(
            "Access denied. Please verify your account or contact support.",
          );
        } else if (result.error === "Verification") {
          toast.error("Please verify your email address before signing in.");
        } else {
          toast.error(`Authentication failed: ${result.error}`);
        }
        return;
      }

      if (!result?.ok) {
        console.error("SignIn failed - not OK:", result);
        toast.error("Sign in failed. Please try again.");
        return;
      }

      console.log("Sign in successful, redirecting...");
      toast.success("Signed in successfully! Redirecting...");

      // Check for redirect parameters
      const redirectParam = searchParams.get("redirect");
      const callbackUrl = searchParams.get("callbackUrl");

      // Determine redirect path based on parameters
      let redirectPath = "/app";

      if (callbackUrl) {
        // User was redirected from a protected route, go back there
        redirectPath = callbackUrl;
      } else if (redirectParam === "checkout") {
        // User was redirected during checkout flow, go to app
        redirectPath = "/app";
      }

      // Small delay to show the success message
      setTimeout(() => {
        router.push(redirectPath);
      }, 1000);
    } catch (error) {
      console.error("Unexpected sign in error:", error);

      // Handle specific error messages thrown from the authorize function
      if (error instanceof Error) {
        // Check for specific error messages we throw in the config
        if (
          error.message.includes("Unable to connect to authentication service")
        ) {
          toast.error(
            "Connection error. Please check your internet connection and try again.",
          );
        } else if (error.message.includes("Too many login attempts")) {
          toast.error(
            "Too many login attempts. Please wait a moment before trying again.",
          );
        } else if (
          error.message.includes(
            "Authentication service is temporarily unavailable",
          )
        ) {
          toast.error(
            "Service temporarily unavailable. Please try again in a moment.",
          );
        } else if (error.message.includes("Authentication request timed out")) {
          toast.error("Request timed out. Please try again.");
        } else if (
          error.message.includes(
            "An unexpected error occurred during authentication",
          )
        ) {
          toast.error(
            "Unexpected authentication error. Please try again or contact support.",
          );
        } else {
          // For any other Error instances, show the actual message
          toast.error(error.message);
        }
      } else {
        // For non-Error instances, show generic message
        toast.error(
          "An unexpected error occurred during sign in. Please try again.",
        );
      }
    }
  };

  return (
    <div className={styles.signinForm}>
      {/* <div className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-2xl border-0"> */}

      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600">
        <Stamp className="h-5 w-5 text-white" />
      </div>
      <h1 className={styles.formTitle}>Sign in to your account</h1>
      <p className="mb-6 text-gray-600">Welcome back to Threeyem Stamps</p>
      <Form {...form}>
        <form
          className={styles.form}
          onSubmit={form.handleSubmit(handleSignIn)}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Mail className="h-4 w-4 text-blue-600" />
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="Enter your email address"
                    className="placeholder:text-gray-400"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Lock className="h-4 w-4 text-blue-600" />
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={field.value}
                      className="placeholder:text-gray-400"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={styles.passwordVisibilityToggle}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff
                          className={styles.passwordVisibilityToggleIcon}
                        />
                      ) : (
                        <Eye
                          className={styles.passwordVisibilityToggleIcon}
                        />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            className="mt-2 bg-blue-600 text-white hover:bg-blue-400"
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
            {!form.formState.isSubmitting && (
              <ArrowRight className="ml-2 h-4 w-4" />
            )}
          </Button>
        </form>
      </Form>
      <Link className={styles.signupLink} href="/auth/signup">
        New user? Signup
      </Link>
    </div>
    // </div>
  );
}
