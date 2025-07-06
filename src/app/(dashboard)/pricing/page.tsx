import { getSubscriptionStatus } from "@/actions/subscription/get-subscription-status";
import { PricingPageContent } from "@/components/pricing/PricingPageContent";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import { ADDITIONAL_AI_PLAN, ADDITIONAL_CALENDAR_PLAN, PLANS } from "@/constants/pricing";

export default async function PricingPage() {
  // Obter dados da assinatura usando o novo serviço
  const subscriptionData = await getSubscriptionStatus();

  return (
    <SubscriptionGuard>
      <PricingPageContent
        plans={PLANS}
        additionalCalendarPlan={ADDITIONAL_CALENDAR_PLAN}
        additionalAiPlan={ADDITIONAL_AI_PLAN}
        subscriptionData={subscriptionData}
      />
    </SubscriptionGuard>
  );
}
