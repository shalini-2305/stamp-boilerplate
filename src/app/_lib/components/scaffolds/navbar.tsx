import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

import { Button } from "@acme/ui/button";
import {
  HomeIcon,
  LogIn,
  LogOut as SignoutIcon,
} from "lucide-react";

const Navbar = () => {
  const router = useRouter();

  // TODO: replace this with getServerSession?
  const { data: session } = useSession();
  const user = (session?.user && session.user.id) ?? null;


  return (
    <nav className="relative min-w-[320px] border-b border-gray-200 bg-white shadow-sm">
      <div className="max-w-8xl mx-auto w-full px-4 py-3 sm:px-6 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <Link
              href="/app"
              className="flex min-w-0 items-center gap-2 sm:gap-3"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600 sm:h-10 sm:w-10">
                <HomeIcon className="h-4 w-4 text-white sm:h-6 sm:w-6" />
              </div>
              <h1 className="truncate text-sm font-bold text-gray-800 sm:whitespace-nowrap sm:text-xl">
                App
              </h1>
            </Link>
          </div>

          <div className="hidden items-center gap-3 md:flex lg:gap-4">
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void signOut({ callbackUrl: "/" })}
                className="text-sm text-gray-600 hover:text-blue-600"
              >
                <SignoutIcon className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-blue-600"
                onClick={() => router.push("/api/auth/signin")}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
