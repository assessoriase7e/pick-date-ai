"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { DropdownMenu } from "./ui/dropdown-menu";

// Adicione o parâmetro variant
export function ThemeToggle({
  variant = "default",
}: {
  variant?: "default" | "icon";
}) {
  const { setTheme, theme } = useTheme();

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <Button
        variant="ghost"
        aria-label="Toggle theme"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {theme === "dark" ? (
          <span className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
          </span>
        )}
      </Button>
    </DropdownMenu>
  );
}
