
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay } from "date-fns";
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
  PES_CODIGO: string;
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
  }>;
}

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

      // Primeiro, buscamos os PES_CODIGO distintos para o período
      const { data: pessoasCodigos, error: errorPessoas } = await supabase
        .from('BLUEBAY_PEDIDO')
        .select('PES_CODIGO')
        .eq('CENTROCUSTO', 'JAB')
        .gte('DATA_PEDIDO', dataInicial)
        .lte('DATA_PEDIDO', dataFinal)
        .not('PES_CODIGO', 'is', null);

      if (errorPessoas) {
        console.error('Erro ao buscar códigos de pessoas:', errorPessoas);
        throw errorPessoas;
      }

      if (!pessoasCodigos || pessoasCodigos.length === 0) {
        console.log('Nenhum código de pessoa encontrado para o período');
        return [];
      }

      // Obtemos os códigos únicos
      const uniquePesCodigos = [...new Set(pessoasCodigos.map(p => p.PES_CODIGO))];

      console.log('Códigos de pessoas únicos encontrados:', uniquePesCodigos.length);

      // Buscamos os dados das pessoas
      const { data: pessoas, error: errorPessoas2 } = await supabase
        .from('BLUEBAY_PESSOA')
        .select('PES_CODIGO, APELIDO')
        .in('PES_CODIGO', uniquePesCodigos);

      if (errorPessoas2) {
        console.error('Erro ao buscar dados das pessoas:', errorPessoas2);
        throw errorPessoas2;
      }

      // Criamos um mapa de PES_CODIGO para APELIDO
      const pessoasMap = new Map(
        pessoas?.map(p => [p.PES_CODIGO, p.APELIDO]) || []
      );

      // Agora buscamos os pedidos
      const { data: pedidosData, error: errorPedidos } = await supabase
        .from('BLUEBAY_PEDIDO')
        .select(`
          MATRIZ,
          FILIAL,
          PED_NUMPEDIDO,
          PED_ANOBASE,
          QTDE_SALDO,
          QTDE_PEDIDA,
          QTDE_ENTREGUE,
          VALOR_UNITARIO,
          PEDIDO_CLIENTE,
          STATUS,
          ITEM_CODIGO,
          DATA_PEDIDO,
          PES_CODIGO
        `)
        .eq('CENTROCUSTO', 'JAB')
        .gte('DATA_PEDIDO', dataInicial)
        .lte('DATA_PEDIDO', dataFinal)
        .in('PES_CODIGO', uniquePesCodigos)
        .order('DATA_PEDIDO', { ascending: false });

      if (errorPedidos) {
        console.error('Erro ao buscar pedidos:', errorPedidos);
        throw errorPedidos;
      }
      
      if (!pedidosData || pedidosData.length === 0) {
        console.log('Nenhum pedido encontrado para o período:', {
          centrocusto: 'JAB',
          dataInicial,
          dataFinal
        });
        return [];
      }

      console.log('Total de pedidos encontrados:', pedidosData.length);

      // Buscamos as descrições dos itens
      const itemCodigos = [...new Set(pedidosData.map(p => p.ITEM_CODIGO).filter(Boolean))];
      const { data: itens } = await supabase
        .from('BLUEBAY_ITEM')
        .select('ITEM_CODIGO, DESCRICAO')
        .in('ITEM_CODIGO', itemCodigos);

      // Criamos o mapa para lookup rápido dos itens
      const itemMap = new Map(
        itens?.map(i => [i.ITEM_CODIGO, i.DESCRICAO]) || []
      );

      // Criamos um Map para armazenar os pedidos agrupados por PES_CODIGO
      const ordersByPessoaMap = new Map<string, JabOrder>();

      // Processamos os pedidos em um único loop
      pedidosData.forEach(pedido => {
        const apelido = pessoasMap.get(pedido.PES_CODIGO);
        const key = pedido.PES_CODIGO;
        const saldo = pedido.QTDE_SALDO || 0;
        const valorUnitario = pedido.VALOR_UNITARIO || 0;

        if (!ordersByPessoaMap.has(key)) {
          ordersByPessoaMap.set(key, {
            MATRIZ: pedido.MATRIZ || 0,
            FILIAL: pedido.FILIAL ?? 0,
            PED_NUMPEDIDO: pedido.PED_NUMPEDIDO || '',
            PED_ANOBASE: pedido.PED_ANOBASE || 0,
            total_saldo: saldo,
            valor_total: saldo * valorUnitario,
            PES_CODIGO: key,
            APELIDO: apelido || null,
            PEDIDO_CLIENTE: pedido.PEDIDO_CLIENTE || null,
            STATUS: pedido.STATUS || '',
            items: []
          });
        } else {
          const order = ordersByPessoaMap.get(key)!;
          order.total_saldo += saldo;
          order.valor_total += saldo * valorUnitario;
        }

        if (pedido.ITEM_CODIGO) {
          const order = ordersByPessoaMap.get(key)!;
          const existingItemIndex = order.items.findIndex(item => item.ITEM_CODIGO === pedido.ITEM_CODIGO);
          
          if (existingItemIndex === -1) {
            order.items.push({
              ITEM_CODIGO: pedido.ITEM_CODIGO,
              DESCRICAO: itemMap.get(pedido.ITEM_CODIGO) || null,
              QTDE_SALDO: saldo,
              QTDE_PEDIDA: pedido.QTDE_PEDIDA || 0,
              QTDE_ENTREGUE: pedido.QTDE_ENTREGUE || 0,
              VALOR_UNITARIO: valorUnitario
            });
          }
        }
      });

      const ordersArray = Array.from(ordersByPessoaMap.values());

      console.log('Número de pedidos agrupados:', ordersArray.length);
      if (ordersArray.length > 0) {
        console.log('Exemplo de pedido agrupado:', ordersArray[0]);
      }

      return ordersArray;
    },
    enabled: !!dateRange?.from && !!dateRange?.to,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
