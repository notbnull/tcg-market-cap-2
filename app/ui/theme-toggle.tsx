"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/app/ui/components/button";
import { useState, useEffect } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.documentElement.classList.toggle("dark", isDark);
    console.log("is dark mode on: ", isDark);
  }, [isDark]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        transform: "translateZ(0)", // Force GPU acceleration
        WebkitTransform: "translateZ(0)", // Safari specific
      }}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsDark(!isDark)}
        className="h-12 w-12 rounded-full shadow-lg border-2 bg-white dark:bg-black hover:scale-110 transition-transform"
      >
        {isDark ? (
          <Sun className="h-6 w-6 text-white" />
        ) : (
          <Moon className="h-6 w-6 text-black" />
        )}
      </Button>
    </div>
  );
}
