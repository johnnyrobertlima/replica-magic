
import { useQuery } from "@tanstack/react-query";
import { fetchSeparacoes } from "@/services/separacaoService";
import { Separacao } from "@/types/separacao";

export function useSeparacoes(centrocusto: 'JAB' | 'BK' = 'JAB') {
  return useQuery<Separacao[]>({
    queryKey: ['separacoes', centrocusto],
    queryFn: () => fetchSeparacoes(centrocusto),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  });
}
