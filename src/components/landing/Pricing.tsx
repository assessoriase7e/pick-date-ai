import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Check, Plus } from "lucide-react";
import Link from "next/link";
import { MovingBorderButton } from "../ui/moving-border";

const PRICING_TEXTS = {
  title: "Planos Simples e Transparentes",
  subtitle: "Escolha o plano ideal para o seu negócio",
  includedFeatures: [
    "Múltiplos calendários",
    "Múltiplos colaboradores",
    "Serviços ilimitados",
    "Lembrete de agendamento",
    "Calendário compartilhado",
    "Envio de arquivos via IA",
    "Envio de links via IA",
    "IA com regras customizadas",
    "Atendimento humanizado",
    "Operação IA 24/7",
    "Atendimento IA via Whatsapp",
    "Relatório completo",
    "Impressão de comandas",
    "Edição de agendamento",
    "Cadastro de clientes",
    "Histórico de clientes",
    "Histórico do profissional",
    "Black List atendimento IA",
  ],
  plans: [
    {
      name: "100 Atendimentos",
      description: "Ideal para pequenos negócios",
      price: "R$ 190",
      period: "/mês",
      features: ["100 atendimentos mensais", "Reset a cada 24 horas", "Suporte via Whatsapp"],
      buttonText: "Começar Agora",
    },
    {
      name: "200 Atendimentos",
      description: "Para negócios em crescimento",
      price: "R$ 329",
      period: "/mês",
      features: ["200 atendimentos mensais", "Reset a cada 24 horas", "Suporte via Whatsapp"],
      buttonText: "Começar Agora",
      recommended: true,
      discount: "10% Off",
    },
    {
      name: "300 Atendimentos",
      description: "Para negócios estabelecidos",
      price: "R$ 467",
      period: "/mês",
      features: ["300 atendimentos mensais", "Reset a cada 24 horas", "Suporte via Whatsapp", ,],
      buttonText: "Começar Agora",
      discount: "15% Off",
    },
  ],
  addons: [
    {
      name: "Pack Adicional",
      price: "R$ 25",
      period: "/10 atendimentos",
      description: "Adicione mais atendimentos conforme necessário",
    },
    {
      name: "SDR (Prospecção de clientes)",
      price: "Em breve",
      period: "",
      description: "Prospecção de clientes que já não consomem a mais de 30 dias, 3 meses e 6 meses",
      comingSoon: true,
    },
  ],
  dashboardButtonText: "Começar",
};

export function Pricing() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{PRICING_TEXTS.title}</h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">{PRICING_TEXTS.subtitle}</p>
        </div>

        {/* Funcionalidades Incluídas */}
        <div className="mx-auto mt-12 max-w-4xl">
          <h3 className="text-xl font-bold mb-6 text-center">Funcionalidades Incluídas em Todos os Planos</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {PRICING_TEXTS.includedFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Planos */}
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PRICING_TEXTS.plans.map((plan, index) => (
              <Card
                key={index}
                className={`flex flex-col justify-between relative ${plan.recommended ? "border-primary" : ""}`}
              >
                {plan.recommended && (
                  <span className="absolute top-3 right-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground z-10">
                    Recomendado
                  </span>
                )}
                {plan.discount && !plan.recommended && (
                  <span className="absolute top-3 right-3 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white z-10">
                    {plan.discount}
                  </span>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl mt-5">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                    {plan.discount && <span className="ml-2 text-sm text-green-500">{plan.discount}</span>}
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3 text-sm">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <SignedOut>
                      <Link href="/sign-up">
                        <MovingBorderButton className="w-full">{plan.buttonText}</MovingBorderButton>
                      </Link>
                    </SignedOut>
                    <SignedIn>
                      <Link href="https://wa.me/5517988421625">
                        <MovingBorderButton className="w-full">{PRICING_TEXTS.dashboardButtonText}</MovingBorderButton>
                      </Link>
                    </SignedIn>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Adicionais */}
        <div className="mx-auto mt-12 max-w-4xl">
          <h3 className="text-xl font-bold mb-6 text-center">Adicionais</h3>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {PRICING_TEXTS.addons.map((addon, index) => (
              <Card key={index} className="flex flex-col justify-between relative">
                {addon.comingSoon && (
                  <span className="absolute top-3 right-3 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white z-10">
                    Em breve
                  </span>
                )}
                <CardHeader>
                  <CardTitle className="text-xl mt-5">{addon.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">{addon.price}</span>
                    <span className="text-muted-foreground">{addon.period}</span>
                  </div>

                  {addon.description && <CardDescription className="mt-2">{addon.description}</CardDescription>}
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
