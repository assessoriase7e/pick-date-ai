import { Hero } from "@/components/hero";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  return (
    <main>
      <div className="h-20 w-full border-b border-border flex  items-center">
        <div className="mx-auto flex justify-between items-center w-full px-10">
          <div className="flex items-center gap-2">
            <Logo />
            <p className="font-semibold text-2xl">Pick Date AI</p>
          </div>

          <SignedOut>
            <Link href="/sign-in">
              <Button variant="outline">Entrar</Button>
            </Link>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center justify-center gap-2">
              <Link href="/calendar">
                <Button>
                  Painel <ChevronRight />
                </Button>
              </Link>

              <Separator orientation="vertical" className="h-10" />

              <UserButton />
            </div>
          </SignedIn>
        </div>
      </div>
      <Hero />
    </main>
  );
}
