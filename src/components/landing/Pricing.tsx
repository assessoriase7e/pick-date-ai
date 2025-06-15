import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Plus } from "lucide-react";
import Link from "next/link";
import { MovingBorderButton } from "../ui/moving-border";

const PRICING_TEXTS = {
  title: "Planos Simples e Transparentes",
  subtitle: "Escolha o plano ideal para o seu negócio",
  freeTrialText: "🎉 Todos os planos incluem 3 dias grátis para testar!",
  basicFeatures: [
    "Múltiplos calendários",
    "Múltiplos colaboradores",
    "Serviços ilimitados",
    "Lembrete de agendamento",
    "Calendário compartilhado",
    "Edição de agendamento",
    "Cadastro de clientes",
    "Histórico de clientes",
    "Histórico do profissional",
  ],
  includedFeatures: [
    "Múltiplos calendários",
    "Múltiplos colaboradores",
    "Serviços ilimitados",
    "Lembrete de agendamento",
    "Perguntas e Respostas via IA",
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
      name: "Agenda Base",
      description: "Agendamento simples sem IA",
      price: "R$ 59,90",
      period: "/mês",
      features: [
        "Agendamento manual",
        "3 Calendários",
        "Cadastro de clientes manual",
        "Histórico de serviços",
        "Suporte via email",
        "Demais funções básicas",
      ],
      buttonText: "Teste 3 Dias Grátis",
      isBasic: true,
    },
    {
      name: "IA 100",
      description: "Ideal para pequenos negócios",
      price: "R$ 190",
      period: "/mês",
      features: [
        "100 atendimentos mensais",
        "3 Calendários inicias",
        ,
        "Reset a cada 24 horas",
        "Suporte via Whatsapp",
      ],
      buttonText: "Teste 3 Dias Grátis",
    },
    {
      name: "IA 200",
      description: "Para negócios em crescimento",
      price: "R$ 329",
      period: "/mês",
      features: ["200 atendimentos mensais", "3 Calendários inicias", "Reset a cada 24 horas", "Suporte via Whatsapp"],
      buttonText: "Teste 3 Dias Grátis",
      recommended: true,
      discount: "10% Off",
    },
    {
      name: "IA 300",
      description: "Para negócios estabelecidos",
      price: "R$ 467",
      period: "/mês",
      features: ["300 atendimentos mensais", "3 Calendários inicias", "Reset a cada 24 horas", "Suporte via Whatsapp"],
      buttonText: "Teste 3 Dias Grátis",
      discount: "15% Off",
    },
  ],
  addons: [
    {
      name: "Atendimentos Adicionais",
      price: "R$ 25",
      period: "/10 atendimentos",
      description: "Adicione mais atendimentos IA conforme necessário",
    },
    {
      name: "Calendário Adicional",
      price: "R$ 10",
      period: "/1 Agenda",
      description: "Adicione mais agendas conforme necessário",
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
  // Separar planos básicos dos planos com IA
  const basicPlan = PRICING_TEXTS.plans.find((plan) => plan.isBasic);
  const aiPlans = PRICING_TEXTS.plans.filter((plan) => !plan.isBasic);

  return (
    <section>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 w-full space-y-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{PRICING_TEXTS.title}</h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">{PRICING_TEXTS.subtitle}</p>
          <div className="mt-4">
            <span className="bg-gradient-to-r from-secondary to-primary text-white px-6 py-2 rounded-full text-lg font-semibold inline-block">
              {PRICING_TEXTS.freeTrialText}
            </span>
          </div>
        </div>

        {/* Funcionalidades Incluídas nos Planos com IA */}
        <div className="mx-auto max-w-5xl">
          <h3 className="text-xl font-bold mb-6 text-center">Funcionalidades Incluídas nos Planos com IA</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {PRICING_TEXTS.includedFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Planos com IA */}
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 h-full gap-5">
            <Card className="flex justify-between relative">
              <CardHeader className="flex-row justify-center">
                <CardTitle className="text-2xl mt-5">{basicPlan.name}</CardTitle>
                <CardDescription className="text-xs">{basicPlan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{basicPlan.price}</span>
                  <span className="text-muted-foreground">{basicPlan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex justify-center">
                <div className="mb-4 p-3 rounded-lg">
                  <ul className="space-y-1 text-sm">
                    {basicPlan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {aiPlans.map((plan, index) => (
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
                  <CardDescription className="text-xs">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  {plan.discount && <span className="text-sm text-green-500">{plan.discount}</span>}
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
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Adicionais */}
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {PRICING_TEXTS.addons.map((addon, index) => (
              <Card key={index} className="flex flex-col justify-between relative">
                {addon.comingSoon && (
                  <span className="absolute top-3 right-3 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white z-10">
                    Em breve
                  </span>
                )}
                <CardHeader>
                  <CardTitle className="text-xl mt-5 text-center lg:text-start">{addon.name}</CardTitle>
                  <div className="mt-4 flex flex-col items-center justify-center lg:justify-start lg:flex-row">
                    <span className="text-3xl font-bold">{addon.price}</span>
                    <span className="ml-1 text-muted-foreground">{addon.period}</span>
                  </div>

                  {addon.description && (
                    <CardDescription className="mt-2 text-center lg:text-start">{addon.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-blue-500" />
                    <span className="text-center lg:text-start">Adicione conforme sua necessidade</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto ">
          <Link href="https://wa.me/5517988421625">
            <MovingBorderButton className="w-full text-2xl" containerClassName="h-32">
              Comecar
            </MovingBorderButton>
          </Link>
        </div>
      </div>
    </section>
  );
}
