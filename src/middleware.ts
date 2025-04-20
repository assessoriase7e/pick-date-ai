import {
  clerkMiddleware,
  createRouteMatcher,
  currentUser,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/unauthorized(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();

  // Se o usuário está autenticado e não está em uma rota pública, verifica o papel de administrador
  if (userId && !isPublicRoute(req)) {
    try {
      const user = await currentUser();
      const isAdmin = user?.publicMetadata?.role === "admin";

      if (!isAdmin) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      return redirectToSignIn({ returnBackUrl: "/sign-in" });
    }
  }

  // Se o usuário não está autenticado e a rota não é pública, redireciona para o sign-in
  if (!userId && !isPublicRoute(req)) {
    return redirectToSignIn({ returnBackUrl: "/sign-in" });
  }

  // Se o usuário está autenticado e tenta acessar a página de sign-in, redireciona para o dashboard
  if (userId && req.nextUrl.pathname === "/sign-in") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
