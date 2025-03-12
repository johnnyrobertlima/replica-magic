
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchTitulosVencidos } from "@/utils/financialUtils";

export interface ClientFinancialData {
  valoresVencidos: number;
  volumeSaudavel: number | null;
  representanteNome: string | null;
}

export const useClientFinancialData = (clientCodes: number[]) => {
  const [clientFinancialData, setClientFinancialData] = useState<Record<number, ClientFinancialData>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!clientCodes.length) {
        setClientFinancialData({});
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        // 1. Fetch client info including volume_saudavel_faturamento
        const { data: clientsData, error: clientsError } = await supabase
          .from('BLUEBAY_PESSOA')
          .select('PES_CODIGO, volume_saudavel_faturamento')
          .in('PES_CODIGO', clientCodes.map(String));

        if (clientsError) throw clientsError;

        // 2. Fetch pedidos to get representantes
        const { data: pedidosData, error: pedidosError } = await supabase
          .from('BLUEBAY_PEDIDO')
          .select('PED_NUMPEDIDO, PES_CODIGO, REPRESENTANTE')
          .in('PES_CODIGO', clientCodes.map(String))
          .eq('CENTROCUSTO', 'JAB');

        if (pedidosError) throw pedidosError;

        // Create a map of client codes to representante codes
        const clientToRepresentanteMap = new Map<number, number>();
        
        pedidosData.forEach(pedido => {
          if (pedido.REPRESENTANTE && pedido.PES_CODIGO) {
            clientToRepresentanteMap.set(
              typeof pedido.PES_CODIGO === 'string' ? parseInt(pedido.PES_CODIGO) : pedido.PES_CODIGO,
              typeof pedido.REPRESENTANTE === 'string' ? parseInt(pedido.REPRESENTANTE) : pedido.REPRESENTANTE
            );
          }
        });

        // Get unique representante codes
        const representanteCodes = Array.from(new Set(Array.from(clientToRepresentanteMap.values())));

        // 3. Fetch representante names
        const { data: representantesData, error: representantesError } = await supabase
          .from('BLUEBAY_PESSOA')
          .select('PES_CODIGO, RAZAOSOCIAL')
          .in('PES_CODIGO', representanteCodes.map(String));

        if (representantesError) throw representantesError;

        // Create a map of representante codes to names
        const representanteMap = new Map<number, string>();
        
        representantesData.forEach(rep => {
          representanteMap.set(
            typeof rep.PES_CODIGO === 'string' ? parseInt(rep.PES_CODIGO) : rep.PES_CODIGO,
            rep.RAZAOSOCIAL
          );
        });

        // Initialize result object
        const result: Record<number, ClientFinancialData> = {};

        // 4. For each client, fetch valores vencidos and populate other data
        const promises = clientsData.map(async client => {
          const clientCode = typeof client.PES_CODIGO === 'string' 
            ? parseInt(client.PES_CODIGO) 
            : client.PES_CODIGO;

          // Fetch valores vencidos
          const valoresVencidos = await fetchTitulosVencidos(clientCode);
          
          // Get representante name
          const representanteCode = clientToRepresentanteMap.get(clientCode);
          const representanteNome = representanteCode ? representanteMap.get(representanteCode) || null : null;
          
          result[clientCode] = {
            valoresVencidos,
            volumeSaudavel: client.volume_saudavel_faturamento,
            representanteNome
          };
        });

        await Promise.all(promises);
        
        setClientFinancialData(result);
      } catch (error) {
        console.error("Error fetching financial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [clientCodes]);

  return { clientFinancialData, isLoading };
};
