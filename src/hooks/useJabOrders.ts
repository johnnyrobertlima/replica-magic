
import { useQuery } from "@tanstack/react-query";
import { startOfDay, endOfDay, format } from "date-fns";
import type { DateRange as DayPickerDateRange } from "react-day-picker";
import type { JabOrder } from "@/types/jabOrders";
import { 
  fetchPessoasCodigos, 
  fetchPedidos,
  fetchItensDescricoes,
  processOrders 
} from "@/services/jabOrdersService";

export function useJabOrders(dateRange?: DayPickerDateRange) {
  return useQuery({
    queryKey: ['jab-orders', dateRange?.from?.toISOString(), dateRange?.to?.toISOString()],
    queryFn: async () => {
      if (!dateRange?.from || !dateRange?.to) return [];

      // Garantindo que as datas cubram o dia inteiro
      const fromDate = startOfDay(dateRange.from);
      const toDate = endOfDay(dateRange.to);

      // Formatando para YYYY-MM-DD para evitar problemas com timezone
      const dataInicial = format(fromDate, 'yyyy-MM-dd');
      const dataFinal = format(toDate, 'yyyy-MM-dd');

      console.log('Buscando pedidos para o período:', { 
        dataInicial,
        dataFinal,
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString()
      });

      // Buscar todos os PES_CODIGO que têm pedidos no período
      const dadosAgrupados = await fetchPessoasCodigos(dataInicial, dataFinal);
      console.log('Dados agrupados retornados:', dadosAgrupados);
      
      if (dadosAgrupados.length === 0) {
        console.log('Nenhum código de pessoa encontrado para o período');
        return [];
      }

      // Get unique PES_CODIGO values (sem filtros adicionais)
      const uniquePesCodigos = [...new Set(dadosAgrupados.map(d => d.pes_codigo))];
      console.log('PES_CODIGO únicos encontrados:', {
        total: uniquePesCodigos.length,
        codigos: uniquePesCodigos
      });

      // Buscar todos os pedidos para esses códigos no período
      const pedidosData = await fetchPedidos(dataInicial, dataFinal, uniquePesCodigos);
      console.log('Pedidos encontrados:', {
        total: pedidosData.length,
        porCliente: uniquePesCodigos.map(codigo => ({
          pes_codigo: codigo,
          total: pedidosData.filter(p => p.PES_CODIGO === codigo).length
        }))
      });

      if (pedidosData.length === 0) {
        console.log('Nenhum pedido encontrado para o período');
        return [];
      }

      // Buscar descrições dos itens (sem filtros)
      const itemCodigos = [...new Set(pedidosData.map(p => p.ITEM_CODIGO).filter(Boolean))];
      const itens = await fetchItensDescricoes(itemCodigos);
      const itemMap = new Map(
        itens?.map(i => [i.ITEM_CODIGO, i.DESCRICAO]) || []
      );

      // Processar pedidos sem filtros adicionais
      const processedOrders = processOrders(pedidosData, itemMap);
      console.log('Total de pedidos processados:', processedOrders.length);

      return processedOrders;
    },
    enabled: !!dateRange?.from && !!dateRange?.to,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });
}

export type { JabOrder };
