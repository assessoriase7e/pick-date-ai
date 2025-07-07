// Renomear para refletir que são priceIds
export const STRIPE_PRICE_IDS = {
  basic: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC!,
  ai100: process.env.NEXT_PUBLIC_STRIPE_PRICE_AI_100!,
  ai200: process.env.NEXT_PUBLIC_STRIPE_PRICE_AI_200!,
  ai300: process.env.NEXT_PUBLIC_STRIPE_PRICE_AI_300!,
};

// E atualizar os PLANS para usar priceId:
export const PLANS = [
  {
    id: "basic",
    name: "Agenda Base",
    description: "Agendamento simples sem IA",
    price: "R$ 60",
    period: "/mês",
    priceId: STRIPE_PRICE_IDS.basic, // ← Mudar de productId para priceId
    planType: "basic" as const,
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
    productId: STRIPE_PRICE_IDS.ai100,
    planType: "ai100" as const,
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
    productId: STRIPE_PRICE_IDS.ai200,
    planType: "ai200" as const,
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
    productId: STRIPE_PRICE_IDS.ai300,
    planType: "ai300" as const,
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

export const ADDITIONAL_CALENDAR_PLAN = {
  id: "add-calendar",
  name: "Calendário Adicional",
  description: "Adicione mais um calendário ao seu plano base",
  price: "R$ 10",
  period: "/mês",
  productId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ADD_CALENDAR!,
  features: ["+1 calendário extra", "Compatível com plano base", "Faturamento separado", "Cancele quando quiser"],
};

export const ADDITIONAL_AI_PLAN = {
  id: "add-ai",
  name: "Atendimentos Adicionais",
  description: "Adicione mais atendimentos IA ao seu plano",
  price: "R$ 25",
  period: "/mês",
  productId: process.env.NEXT_PUBLIC_STRIPE_PRICE_AI_300!,
  features: ["+10 atendimentos IA", "Compatível com planos IA", "Faturamento separado", "Cancele quando quiser"],
};

export const PRICING_TEXTS = {
  title: "Escolha o plano ideal para seu negócio",
  subtitle: "Comece com 7 dias grátis em qualquer plano. Cancele quando quiser.",
  freeTrialText: "🎉 7 dias grátis para testar!",
  trialHighlight: "💡 Teste todas as funcionalidades sem compromisso durante o período gratuito",
  plans: PLANS,
  includedFeatures: [
    "Agendamento inteligente com IA",
    "Integração com WhatsApp",
    "Calendários ilimitados",
    "Cadastro automático de clientes",
    "Histórico completo de conversas",
    "Relatórios detalhados",
    "Suporte prioritário",
    "Atualizações automáticas",
    "Backup automático dos dados",
  ],
  addons: [
    {
      name: "Calendário Adicional",
      price: "R$ 10",
      period: "/mês",
      description: "Adicione mais um calendário ao seu plano base",
      comingSoon: false,
    },
    {
      name: "Atendimentos Adicionais",
      price: "R$ 25",
      period: "/mês",
      description: "Adicione mais atendimentos IA ao seu plano",
      comingSoon: false,
    },
  ],
};
