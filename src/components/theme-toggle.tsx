"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex w-full items-center">
      <span>Theme</span>
      <div className="ml-auto flex items-center rounded-md border border-muted-foreground/20 p-1">
        <button
          onClick={() => setTheme("light")}
          className={`rounded-sm p-1 ${
            theme === "light" ? "bg-accent text-accent-foreground" : ""
          }`}
          aria-label="Set light theme"
        >
          <Sun className="h-4 w-4" />
        </button>
        <button
          onClick={() => setTheme("dark")}
          className={`rounded-sm p-1 ${
            theme === "dark" ? "bg-accent text-accent-foreground" : ""
          }`}
          aria-label="Set dark theme"
        >
          <Moon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
