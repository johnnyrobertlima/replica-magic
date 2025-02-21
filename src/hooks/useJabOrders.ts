
import { useQuery } from "@tanstack/react-query";
import { startOfDay, endOfDay } from "date-fns";
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

      const dataInicial = startOfDay(dateRange.from).toISOString();
      const dataFinal = endOfDay(dateRange.to).toISOString();

      console.log('Buscando pedidos para o período:', { 
        dataInicial,
        dataFinal,
        fromDate: dateRange.from,
        toDate: dateRange.to
      });

      // Fetch PES_CODIGO list without any additional filters
      const pessoasCodigos = await fetchPessoasCodigos(dataInicial, dataFinal);
      if (pessoasCodigos.length === 0) {
        console.log('Nenhum código de pessoa encontrado para o período');
        return [];
      }

      // Get unique PES_CODIGO values
      const uniquePesCodigos = [...new Set(pessoasCodigos.map(p => p.PES_CODIGO))];
      console.log('Códigos de pessoas únicos encontrados:', uniquePesCodigos.length);

      // Fetch pedidos
      const pedidosData = await fetchPedidos(dataInicial, dataFinal, uniquePesCodigos);
      if (pedidosData.length === 0) {
        console.log('Nenhum pedido encontrado para o período');
        return [];
      }
      console.log('Total de pedidos encontrados:', pedidosData.length);

      // Fetch item descriptions
      const itemCodigos = [...new Set(pedidosData.map(p => p.ITEM_CODIGO).filter(Boolean))];
      const itens = await fetchItensDescricoes(itemCodigos);
      const itemMap = new Map(
        itens?.map(i => [i.ITEM_CODIGO, i.DESCRICAO]) || []
      );

      // Process orders without any filtering
      return processOrders(pedidosData, itemMap);
    },
    enabled: !!dateRange?.from && !!dateRange?.to,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });
}

export type { JabOrder };
