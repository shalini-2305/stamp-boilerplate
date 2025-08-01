import Head from "next/head";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { env } from "~/env";
import { auth } from "@acme/auth";
import { cn } from "@acme/ui";
import { ThemeProvider } from "@acme/ui/theme";
import { Toaster } from "@acme/ui/toast";
import ClientThemeToggle from "~/app/_lib/components/misc/ClientThemeToggle";
import { TRPCReactProvider } from "~/trpc/react";
import { ZustandProvider } from "~/lib/globalState/GlobalStateProvider";
import "~/app/(pages)/globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(
    env.VERCEL_ENV === "production"
      ? "https://x.ascodelabs.com"
      : "http://localhost:3000",
  ),
  title: "myApp",
  description: "myApp site",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "myApp",
    description: "myApp site",
    url: "https://x.ascodelabs.com",
    siteName: "myApp",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

const SessionProvider = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className={cn("min-h-screen")}>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <TRPCReactProvider>
              <ZustandProvider>{props.children}</ZustandProvider>
            </TRPCReactProvider>
            <ClientThemeToggle />
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
