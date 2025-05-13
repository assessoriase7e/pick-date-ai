import { UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "./ui/separator";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-end space-x-4 p-5">
        <ThemeToggle />
        <Separator orientation="vertical" className="h-6" />

        <UserButton />
      </div>
    </header>
  );
}
