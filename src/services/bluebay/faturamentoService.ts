
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

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

interface FaturamentoFilter {
  startDate?: string;
  endDate?: string;
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

    const filter: FaturamentoFilter = {};

    // Validar se as datas foram fornecidas
    if (startDate && endDate) {
      // Formatar datas para o banco de dados
      filter.startDate = startDate;
      filter.endDate = endDate + "T23:59:59Z"; // Incluir até o fim do dia
      console.log("Aplicando filtro de data:", true);
      console.log("Datas formatadas:", filter.startDate, filter.endDate);
    }

    // Tentativa alternativa: buscar diretamente da tabela com join na query em vez de usar a função RPC
    const { data, error } = await supabase
      .from("BLUEBAY_FATURAMENTO")
      .select("*")
      .gte("DATA_EMISSAO", filter.startDate || "1900-01-01")
      .lte("DATA_EMISSAO", filter.endDate || "2100-12-31");

    if (error) {
      console.error("Erro ao buscar dados de faturamento:", error);
      throw error;
    }

    // Filtrar apenas itens que pertencem a pedidos com CENTROCUSTO = 'BLUEBAY'
    // Essa é uma solução temporária até corrigirmos a função RPC
    const pedidosPromise = supabase
      .from("BLUEBAY_PEDIDO")
      .select("MATRIZ, FILIAL, PED_NUMPEDIDO, PED_ANOBASE, MPED_NUMORDEM")
      .eq("CENTROCUSTO", "BLUEBAY");

    const { data: pedidosData, error: pedidosError } = await pedidosPromise;

    if (pedidosError) {
      console.error("Erro ao buscar pedidos BLUEBAY:", pedidosError);
      throw pedidosError;
    }

    // Criar um mapa para facilitar a verificação
    const pedidosMap = new Map();
    pedidosData?.forEach(pedido => {
      const key = `${pedido.MATRIZ}-${pedido.FILIAL}-${pedido.PED_NUMPEDIDO}-${pedido.PED_ANOBASE}-${pedido.MPED_NUMORDEM}`;
      pedidosMap.set(key, true);
    });

    // Filtrar os faturamentos que correspondem aos pedidos BLUEBAY
    const filteredData = data?.filter(fatura => {
      if (!fatura.PED_NUMPEDIDO || !fatura.PED_ANOBASE || !fatura.MPED_NUMORDEM) {
        return false;
      }
      
      const key = `${fatura.MATRIZ}-${fatura.FILIAL}-${fatura.PED_NUMPEDIDO}-${fatura.PED_ANOBASE}-${fatura.MPED_NUMORDEM}`;
      return pedidosMap.has(key);
    }) || [];

    console.info(`Buscados ${filteredData.length} registros de faturamento para CENTROCUSTO = BLUEBAY`);

    // Se não temos dados ainda, faça uma verificação direta da tabela para diagnóstico
    if (filteredData.length === 0) {
      console.log("Nenhum dado filtrado encontrado");
      
      // Verificar se há dados na tabela de faturamento
      const { count: faturamentoCount, error: countError } = await supabase
        .from('BLUEBAY_FATURAMENTO')
        .select('*', { count: 'exact', head: true });
        
      if (countError) {
        console.error("Erro ao verificar quantidade de faturamento:", countError);
      } else {
        console.log(`Total de registros na tabela BLUEBAY_FATURAMENTO: ${faturamentoCount}`);
      }
      
      // Verificar se há pedidos com CENTROCUSTO = 'BLUEBAY'
      const { count: pedidosCount, error: pedidosCountError } = await supabase
        .from('BLUEBAY_PEDIDO')
        .select('*', { count: 'exact', head: true })
        .eq('CENTROCUSTO', 'BLUEBAY');
        
      if (pedidosCountError) {
        console.error("Erro ao verificar quantidade de pedidos BLUEBAY:", pedidosCountError);
      } else {
        console.log(`Total de pedidos com CENTROCUSTO = BLUEBAY: ${pedidosCount}`);
      }

      // Verificar dados recentes para fins de teste
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
    }
    
    return filteredData;
  } catch (error) {
    console.error("Erro ao buscar dados de faturamento:", error);
    throw error;
  }
};
