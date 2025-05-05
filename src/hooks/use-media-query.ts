import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Definir o valor inicial
    setMatches(media.matches);
    
    // Função para atualizar o estado
    const listener = () => {
      setMatches(media.matches);
    };
    
    // Adicionar listener para mudanças
    media.addEventListener("change", listener);
    
    // Limpar listener ao desmontar
    return () => {
      media.removeEventListener("change", listener);
    };
  }, [query]);

  return matches;
}