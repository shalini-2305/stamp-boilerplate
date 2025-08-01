import Link from "next/link";

import { Button } from "@acme/ui/button";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-10 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 xxs:gap-2 xxs:py-4">
      <h1 className="text-4xl font-bold">Home page</h1>
      <Link className="text-xl underline" href="/app">
        <Button
          variant="outline"
          size="lg"
          className="group relative transform gap-3 rounded-2xl bg-blue-600 px-12 py-6 text-lg font-semibold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-blue-500 hover:text-white"
        >
          App page
          <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
      </Link>
    </div>
  );
}
