"use client";

import type { z } from "zod";
import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

// import EyeSlashIcon from "@acme/assets/src/images/icons/eye-slash.svg";
// import EyeIcon from "@acme/assets/src/images/icons/eye.svg";
import { CreateUserSchema } from "@acme/validators";
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

import { api } from "~/trpc/react";
import styles from "./signupForm.module.css";
import { ArrowRight, Eye, EyeOff, Stamp } from "lucide-react";

// import { signIn } from "@acme/auth";

export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const form = useForm({
    schema: CreateUserSchema,
    defaultValues: {
      name: "",
      email: "",
      password: "",
      full_address: "",
      type: "credentials" as const,
    },
  });

  const [showPassword, setShowPassword] = React.useState(false);

  const signup = api.auth.signup.useMutation({
    onSuccess: (data) => {
      console.log("Signup successful:", {
        name: data.name,
        timestamp: new Date().toISOString(),
      });

      // Confirm email first before signing in
      toast.success(
        "Account created! Before signing in, please check your email to confirm your account .",
        {
          duration: 15_000,
          action: (
            <Button variant="outline" onClick={() => toast.dismiss()}>
              Dismiss
            </Button>
          ),
        },
      );

      // Pass redirect parameters to confirm-email page
      const redirectParam = searchParams.get("redirect");
      const callbackUrl = searchParams.get("callbackUrl");

      let confirmEmailPath = "/auth/confirm-email";
      const params = new URLSearchParams();

      if (redirectParam) {
        params.set("redirect", redirectParam);
      }
      if (callbackUrl) {
        params.set("callbackUrl", callbackUrl);
      }

      if (params.toString()) {
        confirmEmailPath += `?${params.toString()}`;
      }

      router.push(confirmEmailPath);
      return;

      // signin.mutate({
      //   email: form.getValues("email"),
      //   password: form.getValues("password") ?? "",
      // });
    },
    onError: (err) => {
      console.error("Signup error:", {
        message: err.message,
        code: err.data?.code,
        timestamp: new Date().toISOString(),
      });

      // Check if it's a "user already exists" error and show custom message
      if (err.data?.code === "CONFLICT") {
        toast.error("This email id is already registered, please signin", {
          action: (
            <Button
              variant="outline"
              onClick={() => {
                toast.dismiss();
                router.push("/auth/signin");
              }}
            >
              Go to Sign In
            </Button>
          ),
        });
      } else {
        toast.error(err.message || "An error occurred during signup");
      }
    },
  });

  // const handleGoogleSignup = () => {
  //   // Implement Google OAuth sign-in logic here
  //   // This would typically redirect to your OAuth provider
  //   signIn("google", { callbackUrl: "/dashboard" });
  // };

  return (
    <div className={styles.signupForm}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600">
        <Stamp className="h-5 w-5 text-white" />
      </div>
      <h1 className={styles.formTitle}>Create an account</h1>
      <p className="mb-6 text-nowrap text-gray-600">
        Join Threeyem Stamps to create professional stamps
      </p>
      <Form {...form}>
        <form
          className={styles.form}
          onSubmit={form.handleSubmit(
            (data: z.infer<typeof CreateUserSchema>) => {
              signup.mutate({
                ...data,
                type: "credentials" as const,
                password: data.password ?? "",
              });
            },
          )}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter your fullname"
                    className="placeholder:text-gray-400"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={field.value ?? ""}
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

          <FormField
            control={form.control}
            name="full_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Enter your address (optional)"
                    className="placeholder:text-gray-400"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            className="mt-2 bg-blue-600 text-white hover:bg-blue-400"
            type="submit"
            disabled={signup.isPending}
          >
            {signup.isPending ? "Signing up..." : "Sign up"}
            {!signup.isPending && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>

          {/* <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignup}
            disabled={signup.isPending}
          >
            <Image
              src="/google.svg"
              alt="Google"
              width={20}
              height={20}
              className="mr-2"
            />
            Sign up with Google
          </Button> */}
        </form>
      </Form>

      <Link className={styles.signinLink} href="/auth/signin">
        Already have an account? Sign in
      </Link>
    </div>
  );
}
