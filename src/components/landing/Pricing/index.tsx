"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import SectionTitle from "../Common/SectionTitle";
import OfferList from "./OfferList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";

const Pricing = () => {
  const [isMonthly, setIsMonthly] = useState(true);

  const features = [
    "Múltiplos calendários",
    "Colaboradores ilimitados",
    "Serviços ilimitados",
    "Serviços ligados a colaboradores",
    "Pacotes de serviços",
    "Calendário para agendamento",
    "Lembrete de agendamento via whatsapp",
    "Envio de arquivos via whatsapp",
    "Agendamento com profissional baseado em horário",
    "Cadastro de cliente",
    "Agendamento ligado a cliente",
    "Relatório da operação",
    "Envio de links via whatsapp",
  ];

  const firstColumnFeatures = features.slice(0, Math.ceil(features.length / 2));
  const secondColumnFeatures = features.slice(Math.ceil(features.length / 2));

  return (
    <section id="pricing" className="relative z-10 py-16 md:py-20 lg:py-28 px-5">
      <div className="container mx-auto">
        <SectionTitle
          title="Plano Completo de Agendamento"
          paragraph="Todas as funcionalidades que você precisa para gerenciar seus agendamentos de forma profissional."
          center
          width="665px"
        />

        <div className="w-full">
          <div className="wow fadeInUp mb-8 flex justify-center md:mb-12 lg:mb-16" data-wow-delay=".1s">
            <span
              onClick={() => setIsMonthly(true)}
              className={`${
                isMonthly ? "pointer-events-none text-primary" : ""
              } mr-4 cursor-pointer text-base font-semibold`}
            >
              Mensal
            </span>
            <div onClick={() => setIsMonthly(!isMonthly)} className="flex cursor-pointer items-center">
              <div className="relative">
                <div className="h-5 w-14 rounded-full bg-muted shadow-inner"></div>
                <div
                  className={`${
                    isMonthly ? "" : "translate-x-full"
                  } shadow-switch-1 absolute left-0 top-[-4px] flex h-7 w-7 items-center justify-center rounded-full bg-primary transition`}
                >
                  <span className="active h-4 w-4 rounded-full bg-white"></span>
                </div>
              </div>
            </div>
            <span
              onClick={() => setIsMonthly(false)}
              className={`${
                isMonthly ? "" : "pointer-events-none text-primary"
              } ml-4 cursor-pointer text-base font-semibold`}
            >
              Anual
            </span>
          </div>
        </div>

        {/* Plano Principal - Layout Horizontal no Desktop */}
        <div className="mb-8">
          <Card className="relative z-10 shadow-md">
            <CardContent className="p-6">
              {/* Layout Mobile - Vertical */}
              <div className="block md:hidden">
                <div className="mb-6 text-center">
                  <CardTitle className="text-3xl font-bold text-foreground mb-2">
                    R${isMonthly ? "97" : "970"}
                    <span className="ml-1 text-base font-normal text-muted-foreground">
                      /{isMonthly ? "mês" : "ano"}
                    </span>
                  </CardTitle>
                  <h4 className="text-xl font-semibold text-foreground mb-2">Plano Completo</h4>
                  <CardDescription className="text-sm text-muted-foreground mb-4">
                    Todas as funcionalidades para seu negócio
                  </CardDescription>
                  <Button className="w-full mb-6">Comece Agora</Button>
                </div>
                <div className="space-y-2">
                  {features.map((feature, index) => (
                    <OfferList key={index} text={feature} status="active" />
                  ))}
                </div>
              </div>

              {/* Layout Desktop - Horizontal */}
              <div className="hidden md:flex items-center justify-between">
                {/* Informações do Preço */}
                <div className="flex-shrink-0 mr-8">
                  <CardTitle className="text-3xl font-bold text-foreground mb-2">
                    R${isMonthly ? "60" : "576"}
                    <span className="ml-1 text-base font-normal text-muted-foreground">
                      /{isMonthly ? "mês" : "ano"}
                    </span>
                    <span className="text-base ml-1">{!isMonthly && "(20% OFF)"}</span>
                  </CardTitle>
                  <h4 className="text-xl font-semibold text-foreground mb-2">Plano Completo</h4>
                  <CardDescription className="text-sm text-muted-foreground">
                    Todas as funcionalidades para seu negócio
                  </CardDescription>
                </div>

                {/* Funcionalidades em Duas Colunas */}
                <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-2 mx-8">
                  <div className="space-y-2">
                    {firstColumnFeatures.map((feature, index) => (
                      <OfferList key={index} text={feature} status="active" />
                    ))}
                  </div>
                  <div className="space-y-2">
                    {secondColumnFeatures.map((feature, index) => (
                      <OfferList key={index} text={feature} status="active" />
                    ))}
                  </div>
                </div>

                {/* Botão com Seta */}
                <div className="flex-shrink-0 ml-8">
                  <Button className="h-12 w-12 rounded-full p-0">
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Card Calendário Adicional */}
        <div className="max-w-md mx-auto">
          <Card className="relative z-10 shadow-md">
            <CardContent className="p-6 text-center">
              <h4 className="text-lg font-semibold text-foreground mb-2">Calendário Adicional</h4>
              <CardDescription className="text-sm text-muted-foreground mb-4">
                Expanda sua capacidade com calendários extras para diferentes serviços ou colaboradores
              </CardDescription>
              <div className="text-2xl font-bold text-foreground mb-4">
                R$25,00
                <span className="ml-1 text-base font-normal text-muted-foreground">/mês</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
