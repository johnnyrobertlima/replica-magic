
import { useState, useEffect, useCallback } from "react";
import { useSeparacoes } from "@/hooks/useSeparacoes";
import { ClienteFinanceiro } from "@/types/financialClient";
import { getSeparacoesPendentes, getClientesCodigos } from "@/utils/financialUtils";
import { useFinancialDataFetching } from "./financial/useFinancialDataFetching";
import { useHiddenCards } from "./financial/useHiddenCards";
import { useVolumeSaudavel } from "./financial/useVolumeSaudavel";

export type { ClienteFinanceiro } from "@/types/financialClient";

export const useClientesFinanceiros = () => {
  const { data: separacoes = [], isLoading: isLoadingSeparacoes } = useSeparacoes();
  const [clientesFinanceiros, setClientesFinanceiros] = useState<ClienteFinanceiro[]>([]);
  const [dataLoadingComplete, setDataLoadingComplete] = useState(false);
  
  const { isLoading, setIsLoading, fetchFinancialData } = useFinancialDataFetching();
  const { hiddenCards, hideCard } = useHiddenCards();
  const { updateVolumeSaudavel } = useVolumeSaudavel(setClientesFinanceiros);

  // Get separações pendentes with memoization
  const getSeparacoesPendentesCallback = useCallback(() => {
    return getSeparacoesPendentes(separacoes, hiddenCards);
  }, [separacoes, hiddenCards]);

  // Get unique client codes with memoization
  const getClientesCodigosCallback = useCallback((sepPendentes: any[]) => {
    return getClientesCodigos(sepPendentes);
  }, []);

  useEffect(() => {
    // Prevent repeated data fetching
    if (dataLoadingComplete) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        
        const separacoesPendentes = getSeparacoesPendentesCallback();
        const clientesCodigos = getClientesCodigosCallback(separacoesPendentes);

        if (clientesCodigos.length === 0) {
          setClientesFinanceiros([]);
          setDataLoadingComplete(true);
          return;
        }

        // Map clients to their separacoes
        const clienteSeparacoes: Record<number, any[]> = {};
        separacoesPendentes.forEach(sep => {
          if (!clienteSeparacoes[sep.cliente_codigo]) {
            clienteSeparacoes[sep.cliente_codigo] = [];
          }
          clienteSeparacoes[sep.cliente_codigo].push(sep);
        });

        const updatedClientes = await fetchFinancialData(clientesCodigos, clienteSeparacoes);
        setClientesFinanceiros(updatedClientes);
        setDataLoadingComplete(true);
      } catch (error) {
        console.error("Erro geral ao buscar dados:", error);
        setDataLoadingComplete(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [
    getSeparacoesPendentesCallback, 
    getClientesCodigosCallback, 
    dataLoadingComplete,
    fetchFinancialData,
    setIsLoading
  ]);

  // Reset dataLoadingComplete if dependencies change
  useEffect(() => {
    if (separacoes.length > 0 && hiddenCards.size > 0) {
      setDataLoadingComplete(false);
    }
  }, [separacoes, hiddenCards]);

  return {
    clientesFinanceiros,
    isLoading,
    isLoadingSeparacoes,
    hideCard,
    updateVolumeSaudavel
  };
};
