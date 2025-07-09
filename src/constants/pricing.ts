export const STRIPE_PRICE_IDS = {
  basic: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC!,
  addCalendar: process.env.NEXT_PUBLIC_STRIPE_PRICE_ADD_CALENDAR!,
};

// Remover 'as const' para permitir mutabilidade
export const PLANS = [
  {
    id: "basic",
    name: "Agenda Base",
    description: "Agendamento simples",
    price: "R$ 60",
    period: "/mês",
    priceId: STRIPE_PRICE_IDS.basic,
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
]; // Remover 'as const'

export const ADDITIONAL_PLANS = [
  {
    id: "add-calendar",
    name: "Calendário Adicional",
    description: "Adicione mais um calendário ao seu plano base",
    price: "R$ 10",
    period: "/mês",
    priceId: STRIPE_PRICE_IDS.addCalendar,
    planType: "addon" as const,
    features: ["+1 calendário extra", "Compatível com plano base", "Faturamento separado", "Cancele quando quiser"],
    addonType: "calendar" as const,
    requiresBasePlan: true,
  },
]; // Remover 'as const'

export const PRICING_TEXTS = {
  title: "Escolha o plano ideal para seu negócio",
  subtitle: "Comece com 7 dias grátis em qualquer plano. Cancele quando quiser.",
  freeTrialText: "🎉 7 dias grátis para testar!",
  trialHighlight: "💡 Teste todas as funcionalidades sem compromisso durante o período gratuito",
  additionalPlansTitle: "Produtos Adicionais",
  additionalPlansSubtitle: "Expanda seu plano com recursos extras",

  // Adicionar propriedades que a landing page espera
  plans: PLANS,
  addons: [
    {
      name: "Calendário Adicional",
      description: "Adicione mais um calendário ao seu plano base",
      price: "R$ 10",
      period: "/Mês",
      comingSoon: false,
    },
  ],
  includedFeatures: [
    "Agendamento profissional",
    "Histórico completo de atendimentos",
    "Relatórios detalhados",
    "Suporte prioritário",
    "Backup automático",
    "Personalização avançada",
    "API para integrações",
  ],
};
