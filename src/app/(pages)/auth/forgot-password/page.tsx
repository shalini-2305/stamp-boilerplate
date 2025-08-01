"use client";

import { supabase } from "@acme/supabase";
import { Button, Input, toast } from "@acme/ui";
import { useRouter } from "next/navigation";
import { domainName, sleep } from "~/app/_lib/utils";

const ForgotPassword = () => {
  const router = useRouter();
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    try {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      const email = formData.get("email") as string;

      console.log("submit");
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${domainName}/auth/reset-password`,
      });

      toast.success("Password reset email sent");
      await sleep(1_000);
      router.push("/auth/signin");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <h2>Forgot password</h2>
      <p>Enter your email to reset your password</p>
      <form onSubmit={handleSubmit}>
        <Input type="email" placeholder="Email" />
        <Button type="submit">Reset password</Button>
      </form>
    </div>
  );
};

export default ForgotPassword;
