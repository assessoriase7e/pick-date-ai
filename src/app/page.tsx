import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Benefits } from "@/components/landing/Benefits";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { LandingThemeProvider } from "@/components/landing/landing-theme-provider";

export default async function Home() {
  return (
    <LandingThemeProvider>
      <div className="relative overflow-hidden">
        <Header />
        <Hero />
      </div>
      <main className="min-h-screen relative overflow-hidden space-y-40">
        <Features />
        <Benefits />
        <Pricing />
        <CTA />
        <FAQ />
        <Footer />
      </main>
    </LandingThemeProvider>
  );
}
