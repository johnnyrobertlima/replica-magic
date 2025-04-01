
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches faturamento data from the Supabase RPC function
 */
export const fetchBluebayFaturamentoData = async (startDate?: string, endDate?: string) => {
  try {
    console.info("Buscando dados de faturamento com função RPC:", { startDate, endDate });
    
    // Verifica se a consulta está com o filtro correto de CENTROCUSTO
    console.log("Aplicando filtro de CENTROCUSTO: BLUEBAY");
    
    // Usando a função RPC para buscar os dados de faturamento
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_bluebay_faturamento', {
      start_date: startDate,
      end_date: endDate
    });

    if (rpcError) {
      console.error("Erro ao buscar dados de faturamento:", rpcError);
      throw rpcError;
    }

    console.log("Dados retornados da função RPC:", rpcData);
    
    // Verificar quantos registros foram retornados
    const quantidadeRegistros = Array.isArray(rpcData) ? rpcData.length : 0;
    console.log(`Quantidade de registros retornados: ${quantidadeRegistros}`);
    
    // Se não retornou dados, tentar fazer uma consulta direta à tabela para debug
    if (quantidadeRegistros === 0) {
      console.log("Tentando consultar diretamente a tabela BLUEBAY_FATURAMENTO...");
      const { data: directData, error: directError } = await supabase
        .from("BLUEBAY_FATURAMENTO")
        .select("*")
        .limit(5);
        
      if (directError) {
        console.error("Erro ao consultar diretamente a tabela:", directError);
      } else {
        console.log("Amostra direta da tabela BLUEBAY_FATURAMENTO:", directData);
        console.log("Quantidade de registros na amostra direta:", directData?.length || 0);
      }
      
      // Verificar também a tabela BLUEBAY_PEDIDO para confirmar os valores de CENTROCUSTO
      console.log("Consultando amostra da tabela BLUEBAY_PEDIDO...");
      const { data: pedidoData, error: pedidoError } = await supabase
        .from("BLUEBAY_PEDIDO")
        .select("CENTROCUSTO")
        .limit(20);
        
      if (pedidoError) {
        console.error("Erro ao consultar tabela de pedidos:", pedidoError);
      } else {
        console.log("Valores únicos de CENTROCUSTO encontrados:", 
          [...new Set(pedidoData?.map(p => p.CENTROCUSTO))]
        );
      }
    }
    
    return rpcData || [];
  } catch (error) {
    console.error("Erro ao buscar dados de faturamento:", error);
    throw error;
  }
};
