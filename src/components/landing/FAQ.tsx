import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_TEXTS = {
  title: "Perguntas Frequentes",
  subtitle: "Tire suas dúvidas sobre o Pick Date AI",
  questions: [
    {
      question: "Como funciona a inteligência artificial do Pick Date AI?",
      answer:
        "Nossa IA utiliza processamento de linguagem natural avançado para entender as solicitações dos clientes e automaticamente agendar, reagendar ou cancelar compromissos. O sistema aprende continuamente com as interações para melhorar suas respostas.",
    },
    {
      question: "Meus dados estão seguros?",
      answer:
        "Absolutamente. Utilizamos criptografia de ponta a ponta, armazenamento seguro em nuvem com backup automático e seguimos rigorosamente a LGPD. Seus dados e os de seus clientes estão completamente protegidos.",
    },
    {
      question: "Como é o suporte técnico?",
      answer:
        "Oferecemos suporte técnico especializado via chat, email e telefone.",
    },
  ],
};

export function FAQ() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {FAQ_TEXTS.title}
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            {FAQ_TEXTS.subtitle}
          </p>
        </div>
        <div className="mt-16">
          <Accordion type="single" collapsible className="w-full">
            {FAQ_TEXTS.questions.map((item, index) => (
              <AccordionItem
                key={`item-${index + 1}`}
                value={`item-${index + 1}`}
              >
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
