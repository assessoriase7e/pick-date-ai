import { Calendar, Bot, Users, Scissors, BarChart3, Settings } from "lucide-react";
import { JSX } from "react";

interface Feature {
  id: number;
  icon: JSX.Element;
  title: string;
  paragraph: string;
}

const featuresData: Feature[] = [
  {
    id: 1,
    icon: <Calendar className="w-10 h-10" />,
    title: "Gestão de Agenda Inteligente",
    paragraph:
      "Sistema completo de calendários com visualização mensal, semanal e diária. Gerencie múltiplos calendários, horários de trabalho e disponibilidade dos profissionais de forma eficiente.",
  },
  {
    id: 2,
    icon: <Bot className="w-10 h-10" />,
    title: "Agentes de IA Avançados",
    paragraph:
      "Automatize agendamentos com inteligência artificial. Nossos agentes processam solicitações, verificam disponibilidade e confirmam appointments automaticamente via WhatsApp e outros canais.",
  },
  {
    id: 3,
    icon: <Users className="w-10 h-10" />,
    title: "Gestão Completa de Clientes",
    paragraph:
      "Cadastre e gerencie informações detalhadas dos seus clientes. Histórico de agendamentos, preferências, dados de contato e relacionamento personalizado para cada cliente.",
  },
  {
    id: 4,
    icon: <Scissors className="w-10 h-10" />,
    title: "Catálogo de Serviços",
    paragraph:
      "Organize todos os seus serviços com preços, duração e descrições detalhadas. Vincule serviços específicos aos profissionais e configure regras de agendamento personalizadas.",
  },
  {
    id: 5,
    icon: <BarChart3 className="w-10 h-10" />,
    title: "Relatórios e Analytics",
    paragraph:
      "Acompanhe o desempenho do seu negócio com relatórios detalhados. Métricas de agendamentos, receita, clientes mais ativos e análises de tendências para tomada de decisões estratégicas.",
  },
  {
    id: 6,
    icon: <Settings className="w-10 h-10" />,
    title: "Configuração Flexível",
    paragraph:
      "Personalize completamente o sistema às suas necessidades. Configure horários de funcionamento, regras de agendamento, integrações e compartilhe calendários públicos com seus clientes.",
  },
];
export default featuresData;
