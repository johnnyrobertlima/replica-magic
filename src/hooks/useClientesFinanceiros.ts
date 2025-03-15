import { useState, useEffect, useCallback } from "react";
import { useSeparacoes } from "@/hooks/useSeparacoes";
import { ClienteFinanceiro } from "@/types/financialClient";
import { getSeparacoesPendentes, getClientesCodigos } from "@/utils/financialUtils";
import { useFinancialDataFetching } from "./financial/useFinancialDataFetching";
import { useHiddenCards } from "./financial/useHiddenCards";
import { useVolumeSaudavel } from "./financial/useVolumeSaudavel";
import { 
  fetchFinancialTitles, 
  fetchClientInfo, 
  fetchPedidosForRepresentantes, 
  processClientsData 
} from "@/services/financialService";

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
    // Log separations to debug
    console.log(`Processing ${separacoes.length} separations with ${hiddenCards.size} hidden cards`);
    
    if (separacoes.length > 0) {
      console.log("Sample separations:", {
        first: separacoes[0],
        status: separacoes[0].status,
        id: separacoes[0].id
      });
    }
    
    const pendentes = getSeparacoesPendentes(separacoes, hiddenCards);
    console.log(`Found ${pendentes.length} pending separacoes after filtering with ${hiddenCards.size} hidden cards`);
    
    // Log example of first pending separation if available
    if (pendentes.length > 0) {
      console.log('Example pending separation:', {
        id: pendentes[0].id,
        status: pendentes[0].status,
        cliente: pendentes[0].cliente_nome
      });
    }
    
    return pendentes;
  }, [separacoes, hiddenCards]);

  // Get unique client codes with memoization
  const getClientesCodigosCallback = useCallback((sepPendentes: any[]) => {
    const clientCodes = getClientesCodigos(sepPendentes);
    console.log(`Found ${clientCodes.length} unique client codes from pending separations`);
    return clientCodes;
  }, []);

  useEffect(() => {
    // To avoid infinite loops, clear previous state to force reload when dependencies change
    if (separacoes.length > 0) {
      setDataLoadingComplete(false);
    }
  }, [separacoes]);

  useEffect(() => {
    // Prevent repeated data fetching
    if (dataLoadingComplete) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        
        const separacoesPendentes = getSeparacoesPendentesCallback();
        const clientesCodigos = getClientesCodigosCallback(separacoesPendentes);

        if (clientesCodigos.length === 0) {
          console.log('No client codes found, setting empty clientesFinanceiros');
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
        console.log(`Fetched financial data for ${updatedClientes.length} clients`);
        
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

  return {
    clientesFinanceiros,
    isLoading,
    isLoadingSeparacoes,
    hideCard,
    updateVolumeSaudavel
  };
};
