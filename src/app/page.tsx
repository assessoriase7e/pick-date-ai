import { Hero } from "@/components/hero";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
  const user = await currentUser();

  if (user) {
    redirect("/calendar");
  }

  return (
    <main>
      <div className="h-20 w-full border-b border-border flex  items-center">
        <div className="mx-auto flex justify-between items-center w-full px-10">
          <div className="flex items-center gap-2">
            <Logo />
            <p className="font-semibold text-2xl">Pick Date AI</p>
          </div>

          <Link href="/sign-in">
            <Button>Entrar</Button>
          </Link>
        </div>
      </div>
      <Hero />
    </main>
  );
}
