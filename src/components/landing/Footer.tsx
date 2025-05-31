import Logo from "@/components/Logo";

const FOOTER_TEXTS = {
  title: "Pick Date AI",
  copyright: "© 2025 Pick Date AI. Todos os direitos reservados.",
};

export function Footer() {
  return (
    <footer className="bg-muted/50 py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Logo />
            <p className="font-semibold text-xl">{FOOTER_TEXTS.title}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            {FOOTER_TEXTS.copyright}
          </p>
        </div>
        <div className="flex items-center justify-center">
          Assessoria Se7e: 60.058.940/0001-63
        </div>
      </div>
    </footer>
  );
}
