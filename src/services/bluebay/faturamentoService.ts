
import { supabase } from "@/integrations/supabase/client";

// Definir uma interface específica para evitar problemas de tipo excessivamente profundo
export interface BluebayFaturamentoItem {
  MATRIZ: number;
  FILIAL: number;
  ID_EF_DOCFISCAL: number;
  ID_EF_DOCFISCAL_ITEM: number;
  PED_ANOBASE?: number;
  MPED_NUMORDEM?: number;
  PES_CODIGO?: number;
  TRANSACAO?: number;
  QUANTIDADE?: number;
  VALOR_UNITARIO?: number;
  VALOR_DESCONTO?: number;
  VALOR_NOTA?: number;
  DATA_EMISSAO?: string;
  PED_NUMPEDIDO?: string;
  ITEM_CODIGO?: string;
  TIPO?: string;
  NOTA?: string;
  STATUS?: string;
}

export const fetchBluebayFaturamento = async (
  startDate?: string,
  endDate?: string
): Promise<BluebayFaturamentoItem[]> => {
  try {
    console.log("Buscando dados de faturamento com função RPC:", {
      startDate,
      endDate
    });

    // Usando a função RPC que filtra por CENTROCUSTO = 'BLUEBAY'
    const { data, error } = await supabase
      .rpc('get_bluebay_faturamento', { 
        start_date: startDate,
        end_date: endDate ? endDate + "T23:59:59Z" : undefined // Incluir até o fim do dia
      });

    if (error) {
      console.error("Erro ao buscar dados de faturamento:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.info("Nenhum dado de faturamento encontrado para o período");
      
      // Diagnóstico adicional
      const { count: faturamentoCount, error: countError } = await supabase
        .from('BLUEBAY_FATURAMENTO')
        .select('*', { count: 'exact', head: true });
        
      if (countError) {
        console.error("Erro ao verificar quantidade de faturamento:", countError);
      } else {
        console.log(`Total de registros na tabela BLUEBAY_FATURAMENTO: ${faturamentoCount}`);
      }
      
      // Verificar dados recentes para fins de diagnóstico
      const { data: recentData, error: recentError } = await supabase
        .from('BLUEBAY_FATURAMENTO')
        .select('*')
        .order('DATA_EMISSAO', { ascending: false })
        .limit(5);
        
      if (recentError) {
        console.error("Erro ao buscar dados recentes:", recentError);
      } else if (recentData && recentData.length > 0) {
        console.log("Amostra de dados recentes de faturamento:", 
          recentData.map(item => ({
            data: item.DATA_EMISSAO,
            pedido: item.PED_NUMPEDIDO,
            item: item.ITEM_CODIGO
          }))
        );
      }
      
      return [];
    }
    
    console.info(`Buscados ${data.length} registros de faturamento`);
    return data;
  } catch (error) {
    console.error("Erro ao buscar dados de faturamento:", error);
    throw error;
  }
};
