import { useState, useCallback } from "react";
import { ClienteFinanceiro } from "@/types/financialClient";
import { useToast } from "@/hooks/use-toast";
import {
  fetchFinancialTitles,
  fetchClientInfo,
  fetchPedidosForRepresentantes,
  processClientsData,
  fetchValoresVencidos
} from "@/services/financialService";
import { fetchRepresentanteNames } from "@/utils/representativeUtils";

export const useFinancialDataFetching = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const fetchFinancialData = useCallback(async (
    clientesCodigos: number[],
    clienteSeparacoes: Record<number, any[]>
  ) => {
    try {
      setIsLoading(true);

      if (clientesCodigos.length === 0) {
        return [];
      }

      // Fetch financial titles
      const titulos = await fetchFinancialTitles(clientesCodigos);

      // Fetch client info including fator_correcao
      const clientes = await fetchClientInfo(clientesCodigos);

      // Get unique pedido numbers from separações
      const numeroPedidos = Object.values(clienteSeparacoes)
        .flat()
        .flatMap(sep => sep.separacao_itens.map((item: any) => item.pedido))
        .filter((value, index, self) => self.indexOf(value) === index);

      // Initialize maps for representantes
      const representantesCodigos = new Set<number>();
      const clienteToRepresentanteMap = new Map<number, number>();

      if (numeroPedidos.length > 0) {
        // Fetch pedidos to get representantes
        const pedidos = await fetchPedidosForRepresentantes(numeroPedidos);

        if (pedidos && pedidos.length > 0) {
          // Map each cliente to their representante
          pedidos.forEach(pedido => {
            if (pedido.REPRESENTANTE) {
              representantesCodigos.add(pedido.REPRESENTANTE);
              
              // Find the separação with this pedido
              Object.entries(clienteSeparacoes).forEach(([clienteCodigo, seps]) => {
                const clienteCodigoNum = parseInt(clienteCodigo, 10);
                seps.forEach(sep => {
                  if (sep.separacao_itens.some((item: any) => item.pedido === pedido.PED_NUMPEDIDO)) {
                    clienteToRepresentanteMap.set(clienteCodigoNum, pedido.REPRESENTANTE);
                  }
                });
              });
            }
          });
        }
      }
      
      // Fetch representante names
      console.log("Fetching representative names for codes:", Array.from(representantesCodigos));
      const representantesInfo = await fetchRepresentanteNames(Array.from(representantesCodigos));
      console.log("Fetched representative data:", Array.from(representantesInfo.entries()));

      // Create today's date with hours set to 0 to compare only dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Process clients data
      const clientesArray = processClientsData(
        clientes, 
        clienteSeparacoes, 
        clienteToRepresentanteMap, 
        representantesInfo,
        titulos,
        today
      );
      
      // Now fetch overdue values directly for each client
      const updatedClientes = [...clientesArray];
      for (const cliente of updatedClientes) {
        const valorVencido = await fetchValoresVencidos(cliente.PES_CODIGO);
        cliente.valoresVencidos = valorVencido;
      }
      
      return updatedClientes;
    } catch (error) {
      console.error("Erro ao buscar dados financeiros:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados financeiros.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    isLoading,
    setIsLoading,
    fetchFinancialData
  };
};
