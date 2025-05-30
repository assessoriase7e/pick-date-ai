import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Check, Plus } from "lucide-react";
import Link from "next/link";
import { ShimmerButton } from "../magicui/shimmer-button";

const PRICING_TEXTS = {
  title: "Planos Simples e Transparentes",
  subtitle: "Escolha o plano ideal para o seu negócio",
  plans: [
    {
      name: "Plano Base",
      description: "Tudo que você precisa para começar",
      price: "R$ 300",
      period: "/mês",
      features: [
        "1 Agenda",
        "Colaboradores ilimitados (Grátis)",
        "1 Canal de comunicação",
        "Serviços ilimitados (Grátis)",
        "Suporte por email",
        "Relatórios básicos",
      ],
      buttonText: "Começar Agora",
    },
  ],
  addons: [
    {
      name: "Agenda adicional",
      price: "R$ 25",
      period: "/mês por agenda",
      description: "Agenda para agendamentos de serviços",
    },
    {
      name: "Canal adicional",
      price: "R$ 100",
      period: "/mês por canal",
      description: "Canal de comunicação com WhatsApp e Instagram",
    },
    {
      name: "SDR (Prospecção de clientes)",
      price: "R$ 200",
      period: "/mês",
      description:
        "Prospecção de clientes que já não consomem a mais de 30 dias, 3 meses e 6 meses",
    },
  ],
  dashboardButtonText: "Começar",
};

export function Pricing() {
  return (
    <section className="py-24 sm:py-32 bg-muted/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {PRICING_TEXTS.title}
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            {PRICING_TEXTS.subtitle}
          </p>
        </div>

        {/* Plano Base */}
        <div className="mx-auto mt-16 max-w-lg">
          <Card className="flex flex-col justify-between border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">
                  {PRICING_TEXTS.plans[0].name}
                </CardTitle>
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Recomendado
                </span>
              </div>
              <CardDescription>
                {PRICING_TEXTS.plans[0].description}
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  {PRICING_TEXTS.plans[0].price}
                </span>
                <span className="text-muted-foreground">
                  {PRICING_TEXTS.plans[0].period}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3 text-sm">
                {PRICING_TEXTS.plans[0].features.map(
                  (feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  )
                )}
              </ul>
              <div className="mt-8">
                <SignedOut>
                  <Link href="/sign-up">
                    <ShimmerButton className="w-full">
                      {PRICING_TEXTS.plans[0].buttonText}
                    </ShimmerButton>
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link href="/chat">
                    <ShimmerButton className="w-full">
                      {PRICING_TEXTS.dashboardButtonText}
                    </ShimmerButton>
                  </Link>
                </SignedIn>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Adicionais */}
        <div className="mx-auto mt-12 max-w-4xl">
          <h3 className="text-xl font-bold mb-6 text-center">Adicionais</h3>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {PRICING_TEXTS.addons.map((addon, index) => (
              <Card key={index} className="flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="text-xl">{addon.name}</CardTitle>

                  <div className="mt-4">
                    <span className="text-3xl font-bold">{addon.price}</span>
                    <span className="text-muted-foreground">
                      {addon.period}
                    </span>
                  </div>

                  {addon.description && (
                    <CardDescription className="mt-2">
                      {addon.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-blue-500" />
                    <span>Adicione conforme sua necessidade</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
