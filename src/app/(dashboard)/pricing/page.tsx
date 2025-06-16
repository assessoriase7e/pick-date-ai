import { SubscriptionGuard } from "@/components/SubscriptionGuard";
import { PricingPageContent } from "@/components/pricing/PricingPageContent";

// IDs dos produtos do Stripe vindos das variáveis de ambiente
const STRIPE_PRODUCT_IDS = {
  basic: process.env.NEXT_PUBLIC_STRIPE_PRODUCT_BASIC!,
  ai100: process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_100!,
  ai200: process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_200!,
  ai300: process.env.NEXT_PUBLIC_STRIPE_PRODUCT_AI_300!,
};

const PLANS = [
  {
    id: "basic",
    name: "Agenda Base",
    description: "Agendamento simples sem IA",
    price: "R$ 59,90",
    period: "/mês",
    productId: STRIPE_PRODUCT_IDS.basic,
    features: [
      "Agendamento manual",
      "3 Calendários",
      "Cadastro de clientes manual",
      "Histórico de serviços",
      "Suporte via email",
      "Demais funções básicas",
    ],
    isBasic: true,
  },
  {
    id: "ai100",
    name: "100 Atendimentos IA",
    description: "Ideal para pequenos negócios",
    price: "R$ 190",
    period: "/mês",
    productId: STRIPE_PRODUCT_IDS.ai100,
    features: [
      "100 atendimentos mensais",
      "Reset a cada 24 horas",
      "Suporte via Whatsapp",
      "IA com regras customizadas",
      "Atendimento humanizado",
      "Operação IA 24/7",
    ],
  },
  {
    id: "ai200",
    name: "200 Atendimentos IA",
    description: "Para negócios em crescimento",
    price: "R$ 329",
    period: "/mês",
    productId: STRIPE_PRODUCT_IDS.ai200,
    features: [
      "200 atendimentos mensais",
      "Reset a cada 24 horas",
      "Suporte via Whatsapp",
      "IA com regras customizadas",
      "Atendimento humanizado",
      "Operação IA 24/7",
    ],
    recommended: true,
    discount: "10% Off",
  },
  {
    id: "ai300",
    name: "300 Atendimentos IA",
    description: "Para negócios estabelecidos",
    price: "R$ 467",
    period: "/mês",
    productId: STRIPE_PRODUCT_IDS.ai300,
    features: [
      "300 atendimentos mensais",
      "Reset a cada 24 horas",
      "Suporte via Whatsapp",
      "IA com regras customizadas",
      "Atendimento humanizado",
      "Operação IA 24/7",
    ],
    discount: "15% Off",
  },
];

const ADDITIONAL_CALENDAR_PLAN = {
  id: "add-calendar",
  name: "Calendários Adicionais",
  description: "Adicione mais calendários ao seu plano base",
  price: "R$ 29,90",
  period: "/mês",
  productId: process.env.NEXT_PUBLIC_STRIPE_PRODUCT_ADD_CALENDAR!,
  features: ["+10 calendários extras", "Compatível com plano base", "Faturamento separado", "Cancele quando quiser"],
};

const ADDITIONAL_AI_PLAN = {
  id: "add-ai",
  name: "Atendimentos Adicionais",
  description: "Adicione mais atendimentos IA ao seu plano",
  price: "R$ 49,90",
  period: "/mês",
  productId: process.env.NEXT_PUBLIC_STRIPE_PRODUCT_ADD_10!,
  features: ["+10 atendimentos IA", "Compatível com planos IA", "Faturamento separado", "Cancele quando quiser"],
};

export default function PricingPage() {
  return (
    <SubscriptionGuard>
      <PricingPageContent 
        plans={PLANS}
        additionalCalendarPlan={ADDITIONAL_CALENDAR_PLAN}
        additionalAiPlan={ADDITIONAL_AI_PLAN}
      />
    </SubscriptionGuard>
  );
}
