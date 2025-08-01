"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@acme/ui/card";
import {
  CheckCircle,
  AlertTriangle,
  Shield,
  ShoppingCart,
  FileText,
} from "lucide-react";

const ConfirmEmail = () => {
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const callbackUrl = searchParams.get("callbackUrl");

  // Determine what the user will be redirected to after confirmation
  const getRedirectMessage = () => {
    if (redirectParam === "checkout") {
      return "After confirming your email, you'll be able to complete your order.";
    }
    if (callbackUrl?.includes("/orders")) {
      return "After confirming your email, you'll be redirected to your orders page.";
    }
    if (callbackUrl) {
      return "After confirming your email, you'll be redirected back to where you were.";
    }
    return "After confirming your email, you can sign in to access all features.";
  };

  const getRedirectIcon = () => {
    if (redirectParam === "checkout") {
      return <ShoppingCart className="h-4 w-4 text-green-600" />;
    }
    if (callbackUrl?.includes("/orders")) {
      return <FileText className="h-4 w-4 text-green-600" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };
  return (
    <div className="w-full max-w-md bg-white/80">
      <div className="relative z-10 w-full max-w-md">
        {/* Main Card */}
        <Card>
          <CardHeader className="pb-6 text-center">
            <h1 className="my-4 text-2xl font-bold text-gray-900">
              Signup Confirmation
            </h1>
            <p className="text-gray-600">
              We&apos;ve sent a confirmation link to your email address
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Success Message */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="mb-1 font-medium text-blue-800">
                    Account Created Successfully!
                  </p>
                  <p className="text-sm text-blue-700">
                    Please check your email to confirm your account before
                    signing in.
                  </p>
                </div>
              </div>
            </div>

            {/* Troubleshooting */}
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600" />
                <div>
                  <p className="mb-2 font-medium text-orange-800">
                    Didn&apos;t receive the email?
                  </p>
                  <ul className="space-y-1 text-sm text-orange-700">
                    <li>• Check your spam or junk folder</li>
                    <li>• Ensure your email address is correct</li>
                    <li>• Wait a few minutes for delivery</li>
                    <li>• Contact support if issues persist</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Next Steps - Show only if there's a redirect */}
            {(redirectParam || callbackUrl) && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                <div className="flex items-start gap-3">
                  {getRedirectIcon()}
                  <div>
                    <p className="mb-1 font-medium text-green-800">
                      Next Steps
                    </p>
                    <p className="text-sm text-green-700">
                      {getRedirectMessage()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Security Note */}
            <div className="border-t border-gray-200 pt-4 text-center">
              <div className="mb-2 flex items-center justify-center gap-2 text-xs text-gray-600">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Your account is secure and protected</span>
              </div>
              <p className="text-xs text-gray-500">
                You can safely close this page and return when you&apos;re ready
                to sign in.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConfirmEmail;
