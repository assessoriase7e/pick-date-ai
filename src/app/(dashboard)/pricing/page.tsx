import { getSubscriptionStatus } from "@/actions/subscription/get-subscription-status";
import { PricingPageContent } from "@/components/pricing/PricingPageContent";
import { PLANS, ADDITIONAL_PLANS } from "@/constants/pricing";

export default async function PricingPage() {
  const subscriptionData = await getSubscriptionStatus();

  return <PricingPageContent plans={PLANS} additionalPlans={ADDITIONAL_PLANS} subscriptionData={subscriptionData} />;
}
