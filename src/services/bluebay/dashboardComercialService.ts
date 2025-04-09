
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';
import { fetchInBatches } from "./utils/batchFetchUtils";
import { processarDadosFaturamento } from "./utils/faturamentoDataUtils";
import { DashboardComercialData, FaturamentoItem, PedidoItem } from "./dashboardComercialTypes";

/**
 * Busca dados de faturamento para o dashboard comercial
 * Versão otimizada que consulta pedidos e faturamento de forma independente
 * exceto quando houver filtro de centro de custo
 */
export const fetchDashboardComercialData = async (
  startDate: Date | null,
  endDate: Date | null,
  centroCusto?: string | null
): Promise<DashboardComercialData> => {
  try {
    // Converte as datas para strings no formato SQL
    const startDateStr = startDate ? format(startDate, 'yyyy-MM-dd') : '';
    const endDateStr = endDate ? format(endDate, 'yyyy-MM-dd') : '';

    console.log(`Buscando dados de dashboard comercial de ${startDateStr} até ${endDateStr}`);
    if (centroCusto) {
      console.log(`Filtrando por centro de custo: ${centroCusto}`);
    }
    
    // Formatar datas para consulta
    const formattedStartDate = `${startDateStr}T00:00:00.000`;
    const formattedEndDate = `${endDateStr}T23:59:59.999`;
    
    let faturamentoItems: FaturamentoItem[] = [];
    let pedidoItems: PedidoItem[] = [];

    // Caso 1: Se houver filtro de centro de custo, fazemos primeiramente a busca de pedidos
    // e depois buscamos o faturamento correspondente
    if (centroCusto) {
      console.log("Buscando pedidos filtrados por centro de custo:", centroCusto);
      
      // 1. Primeiro, buscar os pedidos do centro de custo específico
      const { data: pedidosData, error: pedidosError } = await supabase
        .from('BLUEBAY_PEDIDO')
        .select('*')
        .eq('CENTROCUSTO', centroCusto)
        .gte('DATA_PEDIDO', formattedStartDate)
        .lte('DATA_PEDIDO', formattedEndDate);
        
      if (pedidosError) {
        console.error('Erro ao buscar dados de pedidos por centro de custo:', pedidosError);
        throw pedidosError;
      }
      
      pedidoItems = pedidosData || [];
      console.log(`Encontrados ${pedidoItems.length} pedidos do centro de custo ${centroCusto}`);
      
      // 2. Extrair os números de pedido para buscar os faturamentos correspondentes
      if (pedidoItems.length > 0) {
        // Criar um conjunto de chaves compostas para identificar os pedidos
        const pedidosKeys = pedidoItems.map(pedido => {
          return {
            PED_NUMPEDIDO: pedido.PED_NUMPEDIDO,
            PED_ANOBASE: pedido.PED_ANOBASE,
            MPED_NUMORDEM: pedido.MPED_NUMORDEM
          };
        });
        
        // Buscar faturamentos relacionados a esses pedidos
        // Note: Precisamos fazer uma consulta para cada item devido a limitações do Supabase
        // em consultas com múltiplas condições OR
        const faturamentosPromises = pedidosKeys.map(key => {
          return supabase
            .from('BLUEBAY_FATURAMENTO')
            .select('*')
            .eq('PED_NUMPEDIDO', key.PED_NUMPEDIDO)
            .eq('PED_ANOBASE', key.PED_ANOBASE)
            .eq('MPED_NUMORDEM', key.MPED_NUMORDEM)
            .gte('DATA_EMISSAO', formattedStartDate)
            .lte('DATA_EMISSAO', formattedEndDate);
        });
        
        // Executar todas as consultas em paralelo
        const faturamentosResults = await Promise.all(faturamentosPromises);
        
        // Processar resultados e mesclar com as informações do centro de custo
        faturamentoItems = faturamentosResults
          .filter(result => !result.error && result.data && result.data.length > 0)
          .flatMap(result => {
            return result.data!.map(item => {
              // Encontrar o pedido correspondente para obter CENTROCUSTO
              const pedidoCorrespondente = pedidoItems.find(
                p => p.PED_NUMPEDIDO === item.PED_NUMPEDIDO && 
                     p.PED_ANOBASE === item.PED_ANOBASE &&
                     p.MPED_NUMORDEM === item.MPED_NUMORDEM
              );
              
              // Criar um objeto composto com os dados de faturamento e CENTROCUSTO do pedido
              return {
                ...item,
                CENTROCUSTO: pedidoCorrespondente?.CENTROCUSTO || null,
                DATA_PEDIDO: pedidoCorrespondente?.DATA_PEDIDO || null,
                REPRESENTANTE: pedidoCorrespondente?.REPRESENTANTE || null
              } as FaturamentoItem;
            });
          });
          
        console.log(`Encontrados ${faturamentoItems.length} itens de faturamento para pedidos do centro de custo ${centroCusto}`);
      }
    } 
    // Caso 2: Sem filtro de centro de custo, consultamos as tabelas independentemente
    else {
      console.log("Realizando consultas independentes para FATURAMENTO e PEDIDO");
      
      // 1. Buscar dados de faturamento de forma independente
      const { data: faturamentoData, error: faturamentoError } = await supabase
        .from('BLUEBAY_FATURAMENTO')
        .select('*')
        .gte('DATA_EMISSAO', formattedStartDate)
        .lte('DATA_EMISSAO', formattedEndDate);
      
      if (faturamentoError) {
        console.error('Erro ao buscar dados de faturamento:', faturamentoError);
        throw faturamentoError;
      }

      faturamentoItems = faturamentoData || [];
      console.log(`Encontrados ${faturamentoItems.length} registros de faturamento`);

      // 2. Buscar dados de pedidos de forma independente
      const { data: pedidosData, error: pedidosError } = await supabase
        .from('BLUEBAY_PEDIDO')
        .select('*')
        .gte('DATA_PEDIDO', formattedStartDate)
        .lte('DATA_PEDIDO', formattedEndDate);
      
      if (pedidosError) {
        console.error('Erro ao buscar dados de pedidos:', pedidosError);
        throw pedidosError;
      }

      pedidoItems = pedidosData || [];
      console.log(`Encontrados ${pedidoItems.length} registros de pedidos`);
    }

    console.log(`Total de registros recuperados: ${faturamentoItems.length} faturamentos e ${pedidoItems.length} pedidos`);

    // Processar os dados de faturamento para gerar os agregados
    const {
      dailyFaturamento,
      monthlyFaturamento,
      totalFaturado,
      totalItens,
      mediaValorItem,
      minDate,
      maxDate
    } = processarDadosFaturamento(faturamentoItems, pedidoItems);

    // Considerar dados completos se houver pelo menos algum dado
    const hasCompleteData = faturamentoItems.length > 0 || pedidoItems.length > 0;

    // Retornar os dados processados
    const returnData: DashboardComercialData = {
      dailyFaturamento,
      monthlyFaturamento,
      totalFaturado,
      totalItens,
      mediaValorItem,
      faturamentoItems,
      pedidoItems,
      dataRangeInfo: {
        startDateRequested: startDateStr,
        endDateRequested: endDateStr,
        startDateActual: minDate ? format(minDate, 'yyyy-MM-dd') : null,
        endDateActual: maxDate ? format(maxDate, 'yyyy-MM-dd') : null,
        hasCompleteData
      }
    };

    return returnData;
  } catch (error) {
    console.error('Erro ao buscar dados de dashboard comercial:', error);
    throw error;
  }
};
