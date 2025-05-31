import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "../theme-toggle";

const HEADER_TEXTS = {
  title: "Pick Date AI",
  buttons: {
    signIn: "Entrar",
    dashboard: "Painel",
  },
};

export function Header() {
  return (
    <div className="h-20 w-full border-b border-border flex items-center sticky top-0 z-50 bg-background/25 backdrop-blur-md">
      <div className="mx-auto flex justify-between items-center w-full px-10">
        <div className="flex items-center gap-2">
          <Logo />
          <p className="font-semibold hidden lg:block text-2xl">
            {HEADER_TEXTS.title}
          </p>
        </div>

        <div className="flex gap-5">
          {/* Remova ou comente a linha abaixo para ocultar o toggle de tema */}
          {/* <ThemeToggle /> */}
          <SignedOut>
            <Link href="/sign-in">
              <Button variant="outline">{HEADER_TEXTS.buttons.signIn}</Button>
            </Link>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center justify-center gap-2">
              <Link href="/calendar">
                <Button>
                  {HEADER_TEXTS.buttons.dashboard} <ChevronRight />
                </Button>
              </Link>

              <Separator orientation="vertical" className="h-10" />

              <UserButton />
            </div>
          </SignedIn>
        </div>
      </div>
    </div>
  );
}
