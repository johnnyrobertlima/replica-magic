
import { useQuery } from "@tanstack/react-query";
import { fetchSeparacoes } from "@/services/separacaoService";
import type { Separacao } from "@/types/separacao";

export function useSeparacoes() {
  return useQuery({
    queryKey: ['separacoes'],
    queryFn: fetchSeparacoes
  });
}
