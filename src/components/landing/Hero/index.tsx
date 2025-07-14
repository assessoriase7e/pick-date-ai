import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  return (
    <>
      <section className="relative z-10 overflow-hidden min-h-[calc(100svh-5rem)] flex items-center justify-center p-5 py-20">
        <div className="container mx-auto flex flex-col lg:flex-row gap-10 items-center">
          <div className="-mx-4 flex flex-1 flex-wrap">
            <div className="w-full px-4">
              <div className="wow fadeInUp mx-auto max-w-[800px] text-center" data-wow-delay=".2s">
                <h1 className="mb-5 text-3xl font-bold leading-tight sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight">
                  Simplifique seu agendamento com o Pick Date
                </h1>
                <p className="dark:text-body-color-dark mb-12 text-base !leading-relaxed text-body-color sm:text-lg md:text-xl">
                  Gerencie múltiplos calendários, cadastre clientes e acompanhe o histórico de serviços em uma única
                  plataforma. Comece com 7 dias grátis e transforme a maneira como você organiza sua agenda.
                </p>
                <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                  <Link href="/sign-up">
                    <Button size="lg">🔥 Começar Agora</Button>
                  </Link>
                  <Link href="/sign-in">
                    <Button variant="outline" size="lg">
                      Já tenho uma conta
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center flex-1">
            <Image
              alt="Calendário"
              src="/calendar-hero.png"
              width={1000}
              height={1000}
              className="w-auto h-full flex-1"
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
