import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/api/api-keys(.*)"]);
const isPremiumRoute = createRouteMatcher([
  "/files(.*)",
  "/ai-usage(.*)",
  "/links(.*)",
  "/questions(.*)",
  "/agents(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();

  if (!userId && isProtectedRoute(req)) {
    return redirectToSignIn();
  }

  // Verificar trial expirado para rotas premium
  if (userId && isPremiumRoute(req)) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      });

      if (user) {
        // Verificar período de teste (3 dias)
        const trialEndDate = new Date(user.createdAt);
        trialEndDate.setDate(trialEndDate.getDate() + 3);
        const isTrialActive = new Date() < trialEndDate;

        // Se trial expirou, verificar assinatura
        if (!isTrialActive) {
          const subscription = user.subscription;

          console.log(subscription);

          // Se não tem assinatura ou assinatura inativa, redirecionar para pricing
          if (!subscription || !["active", "trialing"].includes(subscription.status)) {
            const url = new URL("/pricing", req.url);
            return Response.redirect(url);
          }
        }
      }
    } catch (error) {
      console.error("Erro ao verificar trial no middleware:", error);
      // Em caso de erro, permitir acesso para não quebrar a aplicação
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
