"use client";

import { useEffect, useState } from "react";

import { ThemeToggle } from "@acme/ui/theme";

export default function ClientThemeToggle() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4">
      <ThemeToggle />
    </div>
  );
}
