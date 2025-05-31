import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

const CTA_TEXTS = {
  title: "Pronto para revolucionar seus agendamentos?",
  subtitle:
    "Junte-se a centenas de empresas que já transformaram seu atendimento com Pick Date AI",
  buttons: {
    startTrial: "Comece",
    learnMore: "Saber Mais",
    accessDashboard: "Começar",
  },
};

export function CTA() {
  return (
    <section className="py-24 sm:py-32 bg-primary">
      <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
          {CTA_TEXTS.title}
        </h2>
        <p className="mt-6 text-lg leading-8 text-primary-foreground/80">
          {CTA_TEXTS.subtitle}
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <SignedOut>
            <Link href="/sign-up">
              <Button size="lg" className="px-8 bg-accent text-background">
                {CTA_TEXTS.buttons.startTrial}
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" className="bg-accent text-background">
                {CTA_TEXTS.buttons.learnMore}
              </Button>
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/chat">
              <Button size="lg" className="px-8 bg-accent text-background">
                {CTA_TEXTS.buttons.accessDashboard}{" "}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </SignedIn>
        </div>
      </div>
    </section>
  );
}
