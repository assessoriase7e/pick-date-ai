import useSWR from 'swr';
import { ApiKey } from '@prisma/client';

interface ApiKeysResponse {
  apiKeys: ApiKey[];
  totalPages: number;
  currentPage: number;
}

// Função fetcher genérica para SWR
const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) {
        // Tenta extrair uma mensagem de erro do corpo da resposta, se houver
        return res.text().then(text => {
           try {
               const errorBody = JSON.parse(text);
               throw new Error(errorBody.message || `Erro ${res.status}: ${res.statusText}`);
           } catch (e) {
               // Se o corpo não for JSON ou não tiver 'message', usa o statusText
               throw new Error(`Erro ${res.status}: ${res.statusText || 'Falha ao buscar dados'}`);
           }
        });
    }
    return res.json();
});

export function useApiKeys(page: number = 1) {
  const { data, error, isLoading, mutate } = useSWR<ApiKeysResponse>(
    `/api/api-keys?page=${page}`, // URL da API para buscar as chaves com paginação
    fetcher,
    {
        // Configurações opcionais do SWR
        revalidateOnFocus: true, // Revalida quando a janela ganha foco
        revalidateOnReconnect: true, // Revalida ao reconectar
        shouldRetryOnError: false, // Não tenta novamente automaticamente em caso de erro
        refreshInterval: 0, // Desativa a revalidação por intervalo
    }
  );

  return {
    apiKeys: data?.apiKeys, // As chaves de API retornadas
    totalPages: data?.totalPages ?? 0, // Total de páginas para paginação
    currentPage: data?.currentPage ?? page, // Página atual
    isLoading, // Estado de carregamento
    isError: error, // Objeto de erro, se houver
    mutate, // Função para revalidar/atualizar os dados manualmente
  };
}