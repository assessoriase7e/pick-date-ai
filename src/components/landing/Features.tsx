import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import {
  Bot,
  Calendar,
  Users,
  FileText,
  MessageSquare,
  Link,
  File,
  UserX,
  Code,
  Shield,
  CalendarDays,
  UserCheck,
  AlertTriangle,
  Bell,
} from "lucide-react";

const FEATURES_DATA = [
  {
    name: "Gestão Completa",
    description: "CRUD de serviços, calendários, colaboradores e agendamentos",
    icon: Users,
    className: "md:col-span-1",
    href: "#gestao",
  },
  {
    name: "Associação Inteligente",
    description: "Associação entre colaborador, serviço e calendário",
    icon: UserCheck,
    className: "md:col-span-1",
    href: "#associacao",
  },
  {
    name: "Controle Financeiro",
    description: "Controle da comissão de cada colaborador",
    icon: FileText,
    className: "md:col-span-1",
    href: "#comissao",
  },
  {
    name: "Links Úteis",
    description: "Links úteis para serem enviados pelo agente via WhatsApp",
    icon: Link,
    className: "md:col-span-1",
    href: "#links",
  },
  {
    name: "Envio de Arquivos",
    description: "Arquivos úteis para serem enviados pelo agente via WhatsApp",
    icon: File,
    className: "md:col-span-1",
    href: "#arquivos",
  },
  {
    name: "Lista de Bloqueio",
    description: "Black list de clientes que a IA não atende",
    icon: UserX,
    className: "md:col-span-1",
    href: "#blacklist",
  },
  {
    name: "Script Personalizado",
    description: "Script de agendamento customizado",
    icon: Code,
    className: "md:col-span-1",
    href: "#script",
  },
  {
    name: "Regras Customizadas",
    description: "Regras customizadas para seu negócio",
    icon: Shield,
    className: "md:col-span-1",
    href: "#regras",
  },
  {
    name: "Múltiplos Calendários",
    description: "Criação e gerenciamento de múltiplos calendários",
    icon: CalendarDays,
    className: "md:col-span-1",
    href: "#calendarios",
  },
  {
    name: "Agendamento Inteligente",
    description: "Agendamento relacionado ao profissional e ao serviço",
    icon: Calendar,
    className: "md:col-span-1",
    href: "#agendamento",
  },
  {
    name: "Detecção de Conflitos",
    description: "Detecção automática de conflitos de horários",
    icon: AlertTriangle,
    className: "md:col-span-1",
    href: "#conflitos",
  },
  {
    name: "Lembretes Automáticos",
    description: "Sistema de lembretes automáticos para clientes",
    icon: Bell,
    className: "md:col-span-1",
    href: "#lembretes",
  },
  {
    name: "IA com Linguagem Natural",
    description: "Agente com processamento de linguagem natural",
    icon: Bot,
    className: "md:col-span-1",
    href: "#ia-linguagem",
  },
  {
    name: "Respostas Contextuais",
    description: "Agente com respostas contextuais inteligentes",
    icon: MessageSquare,
    className: "md:col-span-1",
    href: "#respostas",
  },
  {
    name: "Relatórios Completos",
    description: "Relatório completo das operações do seu negócio",
    icon: FileText,
    className: "md:col-span-1",
    href: "#relatorios",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-muted/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Recursos Poderosos
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Descubra como nossa IA pode transformar seu processo de agendamento
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-7xl">
          <BentoGrid className="md:auto-rows-[20rem] md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {FEATURES_DATA.map((feature) => (
              <BentoCard
                key={feature.name}
                name={feature.name}
                description={feature.description}
                Icon={feature.icon}
                className={feature.className}
                href={feature.href}
                background={
                  <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                }
              />
            ))}
          </BentoGrid>
        </div>
      </div>
    </section>
  );
}
