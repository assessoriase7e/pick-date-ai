import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Plus } from "lucide-react";
import Link from "next/link";
import { MovingBorderButton } from "../ui/moving-border";
import { PlanCard } from "../pricing/PlanCard";
import { Plan } from "@/types/subscription";
import { PRICING_TEXTS } from "@/constants/pricing";

// Converter os planos do PRICING_TEXTS para o formato Plan
const convertToPlans = (plans: any[]): Plan[] => {
  return plans.map((plan) => ({
    id: plan.name.toLowerCase().replace(/\s+/g, "-"),
    name: plan.name,
    description: plan.description,
    price: plan.price,
    period: plan.period,
    productId: "", // Não usado na landing page
    planType: plan.isBasic ? "basic" : "ai100", // Valor padrão
    features: plan.features,
    isBasic: plan.isBasic,
    recommended: plan.recommended,
    discount: plan.discount,
  }));
};

export function Pricing() {
  // Separar planos básicos dos planos com IA
  const basicPlan = PRICING_TEXTS.plans.find((plan) => plan.isBasic);
  const aiPlans = PRICING_TEXTS.plans.filter((plan) => !plan.isBasic);

  const convertedBasicPlan = basicPlan ? convertToPlans([basicPlan])[0] : null;
  const convertedAiPlans = convertToPlans(aiPlans);

  return (
    <section>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 w-full space-y-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{PRICING_TEXTS.title}</h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">{PRICING_TEXTS.subtitle}</p>
          <div className="mt-4">
            <span className="bg-gradient-to-r from-secondary to-primary text-white px-6 py-2 rounded-full text-lg font-semibold inline-block animate-pulse">
              {PRICING_TEXTS.freeTrialText}
            </span>
          </div>
          <div className="mt-4 p-4 bg-secondary/10 border border-secondary/30 rounded-lg">
            <p className="text-md font-medium">{PRICING_TEXTS.trialHighlight}</p>
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
            {/* Plano Básico */}
            {convertedBasicPlan && <PlanCard plan={convertedBasicPlan} showButton={false} isLandingPage={true} />}

            {/* Planos com IA */}
            {convertedAiPlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} showButton={false} isLandingPage={true} />
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
