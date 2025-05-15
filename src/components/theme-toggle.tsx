"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Button variant="ghost" size="icon" aria-label="Toggle theme" />;
  }

  return (
    <Button
      variant="ghost"
      aria-label="Toggle theme"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        <span className="flex items-center gap-2">
          <Moon className="h-5 w-5" />
          <p>Escuro</p>
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <Sun className="h-5 w-5" />
          <p>Claro</p>
        </span>
      )}
    </Button>
  );
}
