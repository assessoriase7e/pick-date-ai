"use client";
// Objeto com os links do footer organizados por seção
const footerLinks = {
  linksUteis: {
    titulo: "Links Úteis",
    links: [
      { texto: "Preços", url: "/pricing" },
      { texto: "Sobre", url: "/about" },
    ],
  },
  termos: {
    titulo: "Termos",
    links: [
      { texto: "Termos de Serviço", url: "/" },
      { texto: "Política de Privacidade", url: "/" },
      { texto: "Política de Reembolso", url: "/" },
    ],
  },
  suporte: {
    titulo: "Suporte e Ajuda",
    links: [
      { texto: "Abrir Ticket de Suporte", url: "/contact" },
      { texto: "Termos de Uso", url: "/" },
      { texto: "Sobre", url: "/about" },
    ],
  },
};

const Footer = () => {
  return (
    <>
      <footer className="mx-auto p-5" data-wow-delay=".1s">
        <div className="container mx-auto">
          <div className="-mx-4 flex flex-wrap">
            {/* Links Úteis */}
            <div className="w-full px-4 sm:w-1/2 md:w-1/2 lg:w-2/12 xl:w-2/12">
              <div className="mb-12 lg:mb-16">
                <h2 className="mb-10 text-xl font-bold">{footerLinks.linksUteis.titulo}</h2>
                <ul>
                  {footerLinks.linksUteis.links.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.url}
                        className="dark:text-body-color-dark mb-4 inline-block text-base text-body-color duration-300 hover:text-primary dark:hover:text-primary"
                      >
                        {link.texto}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Termos */}
            <div className="w-full px-4 sm:w-1/2 md:w-1/2 lg:w-2/12 xl:w-2/12">
              <div className="mb-12 lg:mb-16">
                <h2 className="mb-10 text-xl font-bold">{footerLinks.termos.titulo}</h2>
                <ul>
                  {footerLinks.termos.links.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.url}
                        className="dark:text-body-color-dark mb-4 inline-block text-base text-body-color duration-300 hover:text-primary dark:hover:text-primary"
                      >
                        {link.texto}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Suporte e Ajuda */}
            <div className="w-full px-4 md:w-1/2 lg:w-4/12 xl:w-3/12">
              <div className="mb-12 lg:mb-16">
                <h2 className="mb-10 text-xl font-bold">{footerLinks.suporte.titulo}</h2>
                <ul>
                  {footerLinks.suporte.links.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.url}
                        className="dark:text-body-color-dark mb-4 inline-block text-base text-body-color duration-300 hover:text-primary dark:hover:text-primary"
                      >
                        {link.texto}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
