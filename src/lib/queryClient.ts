
import { QueryClient } from '@tanstack/react-query';

// Constantes para configuração global
export const MINUTE = 60 * 1000;
export const DEFAULT_STALE_TIME = 5 * MINUTE; // 5 minutos
export const DEFAULT_CACHE_TIME = 10 * MINUTE; // 10 minutos

// Criar uma instância única do QueryClient para a aplicação
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: DEFAULT_STALE_TIME,
      gcTime: DEFAULT_CACHE_TIME,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
