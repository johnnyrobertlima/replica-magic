
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ClientFinancialData } from "@/types/financialClient";

export const useClientFinancialData = (clientCodes: number[]) => {
  const [clientFinancialData, setClientFinancialData] = useState<Record<number, ClientFinancialData>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDataInBatches = async () => {
      if (!clientCodes.length) {
        setClientFinancialData({});
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const BATCH_SIZE = 5;
        const result: Record<number, ClientFinancialData> = {};

        // Process clients in batches
        for (let i = 0; i < clientCodes.length; i += BATCH_SIZE) {
          const batchClientCodes = clientCodes.slice(i, i + BATCH_SIZE);
          
          // Fetch basic info
          const { data: clientsData, error: clientsError } = await supabase
            .from('BLUEBAY_PESSOA')
            .select('PES_CODIGO, volume_saudavel_faturamento')
            .in('PES_CODIGO', batchClientCodes.map(String));

          if (clientsError) throw clientsError;

          // Fetch títulos vencidos for each client in batch
          const titlesPromises = batchClientCodes.map(async clientCode => {
            const today = new Date().toISOString().split('T')[0];
            
            try {
              const { data: titulos } = await supabase
                .from('BLUEBAY_TITULO')
                .select('VLRSALDO')
                .eq('PES_CODIGO', String(clientCode))
                .lt('DTVENCIMENTO', today)
                .not('VLRSALDO', 'is', null);

              return {
                clientCode,
                valoresVencidos: titulos ? titulos.reduce((sum, titulo) => sum + (parseFloat(titulo.VLRSALDO) || 0), 0) : 0
              };
            } catch (err) {
              console.error(`Error fetching títulos for client ${clientCode}:`, err);
              return { clientCode, valoresVencidos: 0 };
            }
          });

          const titlesResults = await Promise.all(titlesPromises);

          // Combine data for this batch
          clientsData?.forEach(client => {
            const clientCode = typeof client.PES_CODIGO === 'string' ? 
              parseInt(client.PES_CODIGO) : client.PES_CODIGO;
            
            const titlesData = titlesResults.find(t => t.clientCode === clientCode);
            
            result[clientCode] = {
              valoresVencidos: titlesData?.valoresVencidos || 0,
              volumeSaudavel: client.volume_saudavel_faturamento,
              representanteNome: null // Will be populated later by groupOrdersByClient
            };
          });

          // Add a small delay between batches to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        setClientFinancialData(result);
      } catch (error) {
        console.error("Error fetching financial data:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar todos os dados financeiros.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataInBatches();
  }, [clientCodes]);

  return { clientFinancialData, isLoading };
};
