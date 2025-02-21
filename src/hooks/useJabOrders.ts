
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DateRange as DayPickerDateRange } from "react-day-picker";
import type { Database } from "@/integrations/supabase/types";

type BluebayPedido = Database["public"]["Tables"]["BLUEBAY_PEDIDO"]["Row"];
type SupabasePedido = Partial<BluebayPedido>;

export interface JabOrder {
  MATRIZ: number;
  FILIAL: number;
  PED_NUMPEDIDO: string;
  PED_ANOBASE: number;
  total_saldo: number;
  valor_total: number;
  APELIDO: string | null;
  PEDIDO_CLIENTE: string | null;
  STATUS: string;
  items: Array<{
    ITEM_CODIGO: string;
    DESCRICAO: string | null;
    QTDE_SALDO: number;
    QTDE_PEDIDA: number;
    QTDE_ENTREGUE: number;
    VALOR_UNITARIO: number;
    FISICO: number | null;
  }>;
}

interface UseJabOrdersOptions {
  dateRange?: DayPickerDateRange;
  page?: number;
  pageSize?: number;
}

export function useJabOrders({ dateRange, page = 1, pageSize = 15 }: UseJabOrdersOptions = {}) {
  return useQuery({
    queryKey: ['jab-orders', dateRange?.from?.toISOString(), dateRange?.to?.toISOString(), page, pageSize],
    queryFn: async () => {
      if (!dateRange?.from || !dateRange?.to) return { orders: [], totalCount: 0 };

      const dataInicial = dateRange.from.toISOString().split('T')[0];
      const dataFinal = dateRange.to.toISOString().split('T')[0];

      console.log('Buscando pedidos para o período:', { 
        dataInicial,
        dataFinal,
        page,
        pageSize
      });

      // Consulta com paginação direta no banco
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data: pedidosDistintos, error: errorDistintos, count } = await supabase
        .from('BLUEBAY_PEDIDO')
        .select('DISTINCT PED_NUMPEDIDO', { count: 'exact' })
        .eq('CENTROCUSTO', 'JAB')
        .in('STATUS', ['1', '2'])
        .gte('DATA_PEDIDO', dataInicial)
        .lte('DATA_PEDIDO', `${dataFinal} 23:59:59.999`)
        .order('PED_NUMPEDIDO')
        .range(from, to);

      if (errorDistintos) {
        console.error('Erro ao buscar pedidos distintos:', errorDistintos);
        throw errorDistintos;
      }

      if (!pedidosDistintos?.length) {
        return { orders: [], totalCount: count || 0 };
      }

      const numeroPedidos = pedidosDistintos.map(p => p.PED_NUMPEDIDO);
      console.log('Pedidos selecionados para esta página:', numeroPedidos.length);

      // Busca os detalhes dos pedidos
      const { data: pedidosDetalhados, error: errorPedidos } = await supabase
        .from('BLUEBAY_PEDIDO')
        .select(`
          MATRIZ,
          FILIAL,
          PED_NUMPEDIDO,
          PED_ANOBASE,
          QTDE_SALDO,
          VALOR_UNITARIO,
          PES_CODIGO,
          PEDIDO_CLIENTE,
          STATUS,
          ITEM_CODIGO,
          QTDE_PEDIDA,
          QTDE_ENTREGUE
        `)
        .eq('CENTROCUSTO', 'JAB')
        .in('STATUS', ['1', '2'])
        .in('PED_NUMPEDIDO', numeroPedidos);

      if (errorPedidos) {
        console.error('Erro ao buscar detalhes dos pedidos:', errorPedidos);
        throw errorPedidos;
      }

      // Buscamos informações adicionais em paralelo
      const pessoasIds = [...new Set(pedidosDetalhados?.map(p => p.PES_CODIGO).filter(Boolean))];
      const itemCodigos = [...new Set(pedidosDetalhados?.map(p => p.ITEM_CODIGO).filter(Boolean))];

      const [pessoasResponse, itensResponse, estoqueResponse] = await Promise.all([
        supabase
          .from('BLUEBAY_PESSOA')
          .select('PES_CODIGO, APELIDO')
          .in('PES_CODIGO', pessoasIds),
        supabase
          .from('BLUEBAY_ITEM')
          .select('ITEM_CODIGO, DESCRICAO')
          .in('ITEM_CODIGO', itemCodigos),
        supabase
          .from('BLUEBAY_ESTOQUE')
          .select('ITEM_CODIGO, FISICO')
          .in('ITEM_CODIGO', itemCodigos)
      ]);

      // Criamos os mapas para lookup rápido
      const apelidoMap = new Map(pessoasResponse.data?.map(p => [p.PES_CODIGO, p.APELIDO]) || []);
      const itemMap = new Map(itensResponse.data?.map(i => [i.ITEM_CODIGO, i.DESCRICAO]) || []);
      const estoqueMap = new Map(estoqueResponse.data?.map(e => [e.ITEM_CODIGO, e.FISICO]) || []);

      // Agrupamos os pedidos
      const pedidosAgrupados = new Map<string, any[]>();
      pedidosDetalhados?.forEach(pedido => {
        const key = pedido.PED_NUMPEDIDO;
        if (!pedidosAgrupados.has(key)) {
          pedidosAgrupados.set(key, []);
        }
        pedidosAgrupados.get(key)!.push(pedido);
      });

      // Processamos os pedidos agrupados mantendo a ordem original
      const orders: JabOrder[] = numeroPedidos.map(numPedido => {
        const pedidos = pedidosAgrupados.get(numPedido) || [];
        const primeiroPedido = pedidos[0];
        
        let total_saldo = 0;
        let valor_total = 0;
        const items = new Map<string, any>();

        pedidos.forEach(pedido => {
          const saldo = pedido.QTDE_SALDO || 0;
          const valorUnitario = pedido.VALOR_UNITARIO || 0;
          
          total_saldo += saldo;
          valor_total += saldo * valorUnitario;

          if (pedido.ITEM_CODIGO && !items.has(pedido.ITEM_CODIGO)) {
            items.set(pedido.ITEM_CODIGO, {
              ITEM_CODIGO: pedido.ITEM_CODIGO,
              DESCRICAO: itemMap.get(pedido.ITEM_CODIGO) || null,
              QTDE_SALDO: saldo,
              QTDE_PEDIDA: pedido.QTDE_PEDIDA || 0,
              QTDE_ENTREGUE: pedido.QTDE_ENTREGUE || 0,
              VALOR_UNITARIO: valorUnitario,
              FISICO: estoqueMap.get(pedido.ITEM_CODIGO) || null
            });
          }
        });

        return {
          MATRIZ: primeiroPedido.MATRIZ || 0,
          FILIAL: primeiroPedido.FILIAL || 0,
          PED_NUMPEDIDO: primeiroPedido.PED_NUMPEDIDO,
          PED_ANOBASE: primeiroPedido.PED_ANOBASE || 0,
          total_saldo,
          valor_total,
          APELIDO: primeiroPedido.PES_CODIGO ? apelidoMap.get(primeiroPedido.PES_CODIGO) || null : null,
          PEDIDO_CLIENTE: primeiroPedido.PEDIDO_CLIENTE || null,
          STATUS: primeiroPedido.STATUS || '',
          items: Array.from(items.values())
        };
      });

      return {
        orders,
        totalCount: count || 0,
        currentPage: page,
        pageSize
      };
    },
    enabled: !!dateRange?.from && !!dateRange?.to,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
