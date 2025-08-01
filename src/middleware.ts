// export { auth as middleware } from "@acme/auth";

import { NextResponse } from "next/server";

import { auth } from "@acme/auth";

export default auth((req) => {
  const isAuth = !!req.auth;
  const currRoutePath = req.nextUrl.pathname;

  console.log("Middleware auth check:", {
    isAuth,
    path: currRoutePath,
    searchParams: req.nextUrl.searchParams.toString(),
  });

  // Define protected routes that require authentication
  const protectedRoutes = [
    "/app/orders", // Order history and details
  ];

  // Define auth pages
  const authPages = [
    "/auth/signin",
    "/auth/signup",
    "/auth/confirm-email",
    "/auth/forgot-password",
  ];

  const isAuthPage = authPages.some((page) => currRoutePath.startsWith(page));
  const isProtectedRoute = protectedRoutes.some((route) =>
    currRoutePath.startsWith(route),
  );

  // If user is authenticated and trying to access auth pages, redirect to app
  if (isAuth && isAuthPage) {
    console.log(
      "MW - Authenticated user accessing auth page, redirecting to app",
    );

    // Check if there's a redirect parameter to preserve the checkout flow
    const redirectParam = req.nextUrl.searchParams.get("redirect");
    if (redirectParam === "checkout") {
      // User completed auth during checkout, redirect to app with flow restoration
      return NextResponse.redirect(new URL("/app", req.url));
    }

    // Normal redirect to app for other auth page access
    return NextResponse.redirect(new URL("/app", req.url));
  }

  // If user is not authenticated and trying to access protected routes
  if (!isAuth && isProtectedRoute) {
    console.log(
      "MW - Unauthenticated user accessing protected route, redirecting to signin",
    );

    // Preserve the original URL for redirect after authentication
    const redirectUrl = new URL("/auth/signin", req.url);
    redirectUrl.searchParams.set("callbackUrl", currRoutePath);

    return NextResponse.redirect(redirectUrl);
  }

  // Allow all other requests to proceed
  return NextResponse.next();
});

// Configure which paths the middleware should run on
export const config = {
  // Run on all routes except static files, API routes, and assets
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
