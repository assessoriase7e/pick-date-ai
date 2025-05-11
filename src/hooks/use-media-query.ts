"use client";

import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Definir o valor inicial
    setMatches(media.matches);
    
    // Callback para quando o valor mudar
    const listener = () => setMatches(media.matches);
    
    // Adicionar listener
    media.addEventListener("change", listener);
    
    // Limpar listener
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
