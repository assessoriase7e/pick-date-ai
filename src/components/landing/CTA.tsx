import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

const CTA_TEXTS = {
  title: "Pronto para revolucionar seus agendamentos?",
  subtitle: "Junte-se a centenas de empresas que já transformaram seu atendimento com Pick Date AI",
  freeTrialText: "Teste grátis por 3 dias SEM LIMITES - sem compromisso!",
  trialHighlight: "Acesso completo a todos os recursos durante o período de teste",
  buttons: {
    startTrial: "Teste 3 Dias Grátis",
    learnMore: "Saber Mais",
    accessDashboard: "Começar",
  },
};

export function CTA() {
  return (
    <section className="bg-primary py-10">
      <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">{CTA_TEXTS.title}</h2>
        <p className="mt-6 text-lg leading-8 text-primary-foreground/80">{CTA_TEXTS.subtitle}</p>
        <div className="mt-4 mb-2">
          <span className="bg-white/20 text-primary-foreground px-6 py-3 rounded-full text-lg font-semibold inline-block animate-pulse">
            {CTA_TEXTS.freeTrialText}
          </span>
        </div>
        <p className="text-primary-foreground/90 mb-6 font-medium">{CTA_TEXTS.trialHighlight}</p>
        
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
            <Link href="https://wa.me/5517988421625">
              <Button size="lg" className="px-8 bg-accent text-background">
                {CTA_TEXTS.buttons.accessDashboard} <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </SignedIn>
        </div>
      </div>
    </section>
  );
}
