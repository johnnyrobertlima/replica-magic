
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';
import { fetchInBatches } from "./utils/batchFetchUtils";
import { processarDadosFaturamento } from "./utils/faturamentoDataUtils";
import { DashboardComercialData, FaturamentoItem, PedidoItem } from "./dashboardComercialTypes";

/**
 * Busca dados de faturamento para o dashboard comercial
 * Versão otimizada para garantir que todos os dados do período sejam recuperados
 */
export const fetchDashboardComercialData = async (
  startDate: Date | null,
  endDate: Date | null
): Promise<DashboardComercialData> => {
  try {
    // Converte as datas para strings no formato SQL
    const startDateStr = startDate ? format(startDate, 'yyyy-MM-dd') : '';
    const endDateStr = endDate ? format(endDate, 'yyyy-MM-dd') : '';

    console.log(`Buscando dados de faturamento comercial de ${startDateStr} até ${endDateStr}`);
    
    // Função para buscar dados de faturamento em lotes
    const fetchFaturamentoBatch = async (offset: number, limit: number) => {
      const query = supabase
        .from('BLUEBAY_FATURAMENTO')
        .select('*', { count: 'exact', head: false })
        .eq('TIPO', 'S') // Somente dados de vendas
        .neq('STATUS', '4') // Excluir notas canceladas (STATUS = 4)
        .gte('DATA_EMISSAO', startDateStr)
        .lte('DATA_EMISSAO', `${endDateStr}T23:59:59.999`)
        .range(offset, offset + limit - 1);
      
      return await query;
    };
    
    // Função para buscar dados de pedidos em lotes
    const fetchPedidoBatch = async (offset: number, limit: number) => {
      console.log(`Buscando lote de pedidos ${offset / limit + 1}`);
      
      const query = supabase
        .from('BLUEBAY_PEDIDO')
        .select('*', { count: 'exact', head: false })
        // Filtro removido: .eq('CENTROCUSTO', 'BLUEBAY')
        // Agora busca todos os pedidos independente da marca (CENTROCUSTO)
        .gte('DATA_PEDIDO', startDateStr)
        .lte('DATA_PEDIDO', `${endDateStr}T23:59:59.999`)
        .range(offset, offset + limit - 1);
      
      const result = await query;
      console.log(`Lote de pedidos ${offset / limit + 1}: ${result.data?.length || 0} registros`);
      return result;
    };
    
    // Buscar todos os dados de faturamento e pedidos usando o utilitário de lotes
    const [faturamentoData, pedidoData] = await Promise.all([
      fetchInBatches<FaturamentoItem>(fetchFaturamentoBatch, 1000),
      fetchInBatches<PedidoItem>(fetchPedidoBatch, 1000)
    ]);
    
    console.log(`Total de registros de faturamento recuperados: ${faturamentoData?.length || 0}`);
    console.log(`Total de registros de pedidos recuperados: ${pedidoData?.length || 0}`);

    // Diagnóstico específico para a nota 252566 que apresenta problemas
    const nota252566 = faturamentoData.find(item => item.NOTA === '252566');
    if (nota252566) {
      console.log('Nota 252566 encontrada no faturamento:', nota252566);
      
      // Procurar pedidos correspondentes usando a chave composta
      const pedidosCorrespondentes = pedidoData.filter(p => 
        p.PED_NUMPEDIDO === nota252566.PED_NUMPEDIDO && 
        p.PED_ANOBASE === nota252566.PED_ANOBASE
      );
      
      if (pedidosCorrespondentes.length > 0) {
        console.log('Pedidos correspondentes encontrados para nota 252566:', pedidosCorrespondentes);
      } else {
        console.log('Nenhum pedido correspondente encontrado para a nota 252566');
        
        // Verificar pedidos com o mesmo número (ignorando ano base)
        const pedidosComMesmoNumero = pedidoData.filter(p => 
          p.PED_NUMPEDIDO === nota252566.PED_NUMPEDIDO
        );
        
        if (pedidosComMesmoNumero.length > 0) {
          console.log('Pedidos com o mesmo PED_NUMPEDIDO, mas ano base diferente:', 
            pedidosComMesmoNumero.map(p => ({
              PED_NUMPEDIDO: p.PED_NUMPEDIDO,
              PED_ANOBASE: p.PED_ANOBASE,
              CENTROCUSTO: p.CENTROCUSTO
            }))
          );
        }
      }
    }

    // Processar os dados de faturamento usando o utilitário de processamento
    const {
      dailyFaturamento,
      monthlyFaturamento,
      totalFaturado,
      totalItens,
      mediaValorItem,
      minDate,
      maxDate
    } = processarDadosFaturamento(faturamentoData, pedidoData);

    // Verificar se os dados cobrem todo o período solicitado
    // Consideramos que temos dados completos se temos pelo menos algum dado 
    const hasCompleteData = faturamentoData.length > 0;

    // Retornar os dados processados, incluindo os itens originais para a tabela
    const returnData: DashboardComercialData = {
      dailyFaturamento,
      monthlyFaturamento,
      totalFaturado,
      totalItens,
      mediaValorItem,
      faturamentoItems: faturamentoData,
      pedidoItems: pedidoData,
      dataRangeInfo: {
        startDateRequested: startDateStr,
        endDateRequested: endDateStr,
        startDateActual: minDate ? format(minDate, 'yyyy-MM-dd') : null,
        endDateActual: maxDate ? format(maxDate, 'yyyy-MM-dd') : null,
        hasCompleteData
      }
    };

    console.log(`Processamento concluído: ${dailyFaturamento.length} dias, ${monthlyFaturamento.length} meses`);
    return returnData;
  } catch (error) {
    console.error('Erro ao buscar dados de dashboard comercial:', error);
    throw error;
  }
};
