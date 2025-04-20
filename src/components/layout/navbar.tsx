import Link from "next/link";
import { Home, Users } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between mx-auto">
        <div className="flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Se7e Audio Base</span>
          </Link>
          <nav className="flex items-center space-x-4 lg:space-x-6">
            <Link
              href="/audios"
              className="flex items-center text-sm font-medium transition-colors hover:text-primary"
            >
              <Home className="mr-2 h-4 w-4" />
              Áudios
            </Link>
            <Link
              href="/clients"
              className="flex items-center text-sm font-medium transition-colors hover:text-primary"
            >
              <Users className="mr-2 h-4 w-4" />
              Profissionais
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <UserButton />
        </div>
      </div>
    </header>
  );
}
