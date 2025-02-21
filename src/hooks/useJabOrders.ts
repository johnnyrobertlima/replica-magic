
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

export function useJabOrders(dateRange?: DayPickerDateRange) {
  return useQuery({
    queryKey: ['jab-orders', dateRange?.from?.toISOString(), dateRange?.to?.toISOString()],
    queryFn: async () => {
      if (!dateRange?.from || !dateRange?.to) return [];

      // Formatando as datas para o formato YYYY-MM-DD
      const dataInicial = dateRange.from.toISOString().split('T')[0];
      const dataFinal = dateRange.to.toISOString().split('T')[0];

      console.log('Buscando pedidos para o período:', { 
        dataInicial,
        dataFinal,
        fromDate: dateRange.from,
        toDate: dateRange.to
      });

      // Primeiro fazemos uma query otimizada para pegar apenas os números dos pedidos
      const { data: todosPedidos, error: errorTodosPedidos } = await supabase
        .from('BLUEBAY_PEDIDO')
        .select('PED_NUMPEDIDO')
        .eq('CENTROCUSTO', 'JAB')
        .in('STATUS', ['1', '2'])
        .gte('DATA_PEDIDO', dataInicial)
        .lte('DATA_PEDIDO', `${dataFinal} 23:59:59.999`);

      if (errorTodosPedidos) {
        console.error('Erro ao buscar todos os pedidos:', errorTodosPedidos);
        throw errorTodosPedidos;
      }

      const numeroPedidosDistintos = [...new Set(todosPedidos?.map(p => p.PED_NUMPEDIDO))].sort((a, b) => {
        return parseInt(a.replace(/^0+/, '')) - parseInt(b.replace(/^0+/, ''));
      });
      
      console.log('Total de pedidos distintos encontrados:', numeroPedidosDistintos.length);
      console.log('Lista de pedidos distintos:', numeroPedidosDistintos);

      // Vamos buscar os pedidos em lotes de 50 para melhor performance
      const BATCH_SIZE = 50;
      let allPedidosData: any[] = [];

      for (let i = 0; i < numeroPedidosDistintos.length; i += BATCH_SIZE) {
        const batch = numeroPedidosDistintos.slice(i, i + BATCH_SIZE);
        const { data: batchData, error: errorPedidos } = await supabase
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
          .in('PED_NUMPEDIDO', batch);

        if (errorPedidos) {
          console.error('Erro ao buscar lote de pedidos:', errorPedidos);
          throw errorPedidos;
        }

        if (batchData) {
          allPedidosData = [...allPedidosData, ...batchData];
        }
      }

      if (allPedidosData.length === 0) {
        console.log('Nenhum pedido encontrado para o período');
        return [];
      }

      // Buscamos os apelidos das pessoas e items em paralelo
      const pessoasIds = [...new Set(allPedidosData.map(p => p.PES_CODIGO).filter(Boolean))];
      const itemCodigos = [...new Set(allPedidosData.map(p => p.ITEM_CODIGO).filter(Boolean))];

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

      const pessoas = pessoasResponse.data || [];
      const itens = itensResponse.data || [];
      const estoque = estoqueResponse.data || [];

      // Criamos os mapas para lookup rápido
      const apelidoMap = new Map(pessoas.map(p => [p.PES_CODIGO, p.APELIDO]));
      const itemMap = new Map(itens.map(i => [i.ITEM_CODIGO, i.DESCRICAO]));
      const estoqueMap = new Map(estoque.map(e => [e.ITEM_CODIGO, e.FISICO]));

      // Pré-organizamos os pedidos por número
      const pedidosOrganizados = new Map<string, any[]>();
      allPedidosData.forEach(pedido => {
        const key = pedido.PED_NUMPEDIDO;
        if (!pedidosOrganizados.has(key)) {
          pedidosOrganizados.set(key, []);
        }
        pedidosOrganizados.get(key)!.push(pedido);
      });

      // Agora processamos os pedidos organizados
      const ordersArray: JabOrder[] = numeroPedidosDistintos.map(numPedido => {
        const pedidos = pedidosOrganizados.get(numPedido) || [];
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

      console.log('Número de pedidos agrupados:', ordersArray.length);
      console.log('Lista final de pedidos:', ordersArray.map(o => o.PED_NUMPEDIDO));

      return ordersArray;
    },
    enabled: !!dateRange?.from && !!dateRange?.to,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    gcTime: 10 * 60 * 1000, // Garbage collection após 10 minutos
  });
}
