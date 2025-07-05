"use client";

import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  // Função para detectar dispositivo móvel pelo User-Agent
  const isMobileDevice = () => {
    if (typeof window === "undefined") return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Inicializa com base no User-Agent para dispositivos móveis se a query for relacionada a largura
  const isWidthQuery = query.includes("width");
  const initialValue = isWidthQuery ? isMobileDevice() : false;
  
  const [matches, setMatches] = useState(initialValue);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const media = window.matchMedia(query);

    // Atualiza com o valor real do matchMedia
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
