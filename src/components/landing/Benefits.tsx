import { Clock, Shield, Star, Users } from "lucide-react";

const BENEFITS_TEXTS = {
  title: "Por que escolher Pick Date AI?",
  subtitle: "Benefícios que fazem a diferença no seu negócio",
  benefits: [
    {
      title: "Economia de Tempo",
      description: "Reduza em até 80% o tempo gasto com agendamentos manuais. Nossa IA cuida de tudo para você."
    },
    {
      title: "Experiência do Cliente",
      description: "Ofereça atendimento 24/7 com respostas instantâneas e precisas para seus clientes."
    },
    {
      title: "Segurança e Confiabilidade",
      description: "Dados protegidos com criptografia de ponta e backup automático em nuvem."
    },
    {
      title: "Resultados Comprovados",
      description: "Aumento médio de 40% na taxa de conversão de agendamentos dos nossos clientes."
    }
  ]
};

export function Benefits() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{BENEFITS_TEXTS.title}</h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            {BENEFITS_TEXTS.subtitle}
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="flex gap-x-4">
            <div className="flex-none">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Clock className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-semibold leading-7">{BENEFITS_TEXTS.benefits[0].title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {BENEFITS_TEXTS.benefits[0].description}
              </p>
            </div>
          </div>
          <div className="flex gap-x-4">
            <div className="flex-none">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-semibold leading-7">{BENEFITS_TEXTS.benefits[1].title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {BENEFITS_TEXTS.benefits[1].description}
              </p>
            </div>
          </div>
          <div className="flex gap-x-4">
            <div className="flex-none">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-semibold leading-7">{BENEFITS_TEXTS.benefits[2].title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {BENEFITS_TEXTS.benefits[2].description}
              </p>
            </div>
          </div>
          <div className="flex gap-x-4">
            <div className="flex-none">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Star className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-semibold leading-7">{BENEFITS_TEXTS.benefits[3].title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {BENEFITS_TEXTS.benefits[3].description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}