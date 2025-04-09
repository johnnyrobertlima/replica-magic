
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
      
      // 1. Primeiro, buscar os pedidos do centro de custo específico usando fetchInBatches
      // para evitar limitação de 1000 registros
      pedidoItems = await fetchInBatches<PedidoItem>(
        async (offset, limit) => {
          return supabase
            .from('BLUEBAY_PEDIDO')
            .select('*')
            .eq('CENTROCUSTO', centroCusto)
            .gte('DATA_PEDIDO', formattedStartDate)
            .lte('DATA_PEDIDO', formattedEndDate)
            .range(offset, offset + limit - 1);
        },
        1000 // tamanho do lote, irá buscar em lotes de 1000
      );
      
      console.log(`Encontrados ${pedidoItems.length} pedidos do centro de custo ${centroCusto}`);
      
      // 2. Extrair os números de pedido para buscar os faturamentos correspondentes
      if (pedidoItems.length > 0) {
        // Criar conjuntos de chaves compostas para identificar os pedidos
        // Precisamos agrupar pedidos em lotes para evitar consultas muito grandes
        
        // Buscar faturamentos relacionados ao lote de pedidos
        // utilizando a função fetchInBatches para processar em lotes maiores
        // e não ficar limitado a 1000 registros
        
        // Criar uma função para buscar faturamentos por lotes de pedidos
        const buscarFaturamentosPorLoteDePedidos = async () => {
          const resultado: FaturamentoItem[] = [];
          // Processar em lotes de 100 pedidos para não sobrecarregar o filtro in()
          const tamanhoBatch = 100;
          
          for (let i = 0; i < pedidoItems.length; i += tamanhoBatch) {
            const lotePedidos = pedidoItems.slice(i, i + tamanhoBatch);
            const pedidosNumeros = lotePedidos.map(p => p.PED_NUMPEDIDO);
            
            console.log(`Buscando faturamentos para lote de ${pedidosNumeros.length} pedidos (${i+1} até ${Math.min(i + tamanhoBatch, pedidoItems.length)} de ${pedidoItems.length})`);
            
            const { data: faturamentosLote, error } = await supabase
              .from('BLUEBAY_FATURAMENTO')
              .select('*')
              .in('PED_NUMPEDIDO', pedidosNumeros)
              .gte('DATA_EMISSAO', formattedStartDate)
              .lte('DATA_EMISSAO', formattedEndDate);
              
            if (error) {
              console.error(`Erro ao buscar faturamentos do lote ${i/tamanhoBatch + 1}:`, error);
              continue;
            }
            
            if (faturamentosLote && faturamentosLote.length > 0) {
              // Para cada faturamento, encontrar o pedido correspondente e adicionar o CENTROCUSTO
              const faturamentosProcessados = faturamentosLote.map(faturamento => {
                // Encontrar o pedido correspondente para obter CENTROCUSTO e outras informações
                const pedidoCorrespondente = pedidoItems.find(
                  p => p.PED_NUMPEDIDO === faturamento.PED_NUMPEDIDO && 
                       p.PED_ANOBASE === faturamento.PED_ANOBASE &&
                       p.MPED_NUMORDEM === faturamento.MPED_NUMORDEM
                );
                
                // Criar um objeto composto com os dados de faturamento e dados do pedido
                const itemEnriquecido: FaturamentoItem = {
                  ...faturamento,
                  CENTROCUSTO: pedidoCorrespondente?.CENTROCUSTO || null,
                  CENTRO_CUSTO: pedidoCorrespondente?.CENTRO_CUSTO || pedidoCorrespondente?.CENTROCUSTO || null,
                  DATA_PEDIDO: pedidoCorrespondente?.DATA_PEDIDO || null,
                  REPRESENTANTE: pedidoCorrespondente?.REPRESENTANTE || null,
                  // Adicionar o pedido completo como uma propriedade para acesso fácil
                  pedido: pedidoCorrespondente
                };
                
                return itemEnriquecido;
              });
              
              resultado.push(...faturamentosProcessados);
              console.log(`Adicionados ${faturamentosProcessados.length} faturamentos processados ao resultado. Total atual: ${resultado.length}`);
            }
          }
          
          return resultado;
        };
        
        // Executar a busca em lotes
        faturamentoItems = await buscarFaturamentosPorLoteDePedidos();
        console.log(`Total de ${faturamentoItems.length} itens de faturamento encontrados para pedidos do centro de custo ${centroCusto}`);
      }
    } 
    // Caso 2: Sem filtro de centro de custo, consultamos as tabelas independentemente
    else {
      console.log("Realizando consultas independentes para FATURAMENTO e PEDIDO");
      
      // 1. Buscar dados de faturamento usando fetchInBatches para evitar limitação
      faturamentoItems = await fetchInBatches<FaturamentoItem>(
        async (offset, limit) => {
          return supabase
            .from('BLUEBAY_FATURAMENTO')
            .select('*')
            .gte('DATA_EMISSAO', formattedStartDate)
            .lte('DATA_EMISSAO', formattedEndDate)
            .range(offset, offset + limit - 1);
        },
        1000 // tamanho do lote, irá buscar em lotes de 1000
      );
      
      console.log(`Encontrados ${faturamentoItems.length} registros de faturamento`);

      // 2. Buscar dados de pedidos usando fetchInBatches
      pedidoItems = await fetchInBatches<PedidoItem>(
        async (offset, limit) => {
          return supabase
            .from('BLUEBAY_PEDIDO')
            .select('*')
            .gte('DATA_PEDIDO', formattedStartDate)
            .lte('DATA_PEDIDO', formattedEndDate)
            .range(offset, offset + limit - 1);
        },
        1000 // tamanho do lote
      );
      
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
