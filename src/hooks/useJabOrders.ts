
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay } from "date-fns";
import type { DateRange as DayPickerDateRange } from "react-day-picker";

interface JabOrder {
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
  }>;
}

export function useJabOrders(dateRange?: DayPickerDateRange) {
  return useQuery({
    queryKey: ['jab-orders', dateRange?.from?.toISOString(), dateRange?.to?.toISOString()],
    queryFn: async () => {
      if (!dateRange?.from || !dateRange?.to) return [];

      console.log('Buscando pedidos para o período:', { from: dateRange.from, to: dateRange.to });

      // Primeiro, buscamos os pedidos com paginação para garantir todos os resultados
      let allPedidos = [];
      let page = 0;
      const pageSize = 1000;
      
      while (true) {
        const { data: pedidosPage, error: errorPedidos, count } = await supabase
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
            PES_CODIGO,
            ITEM_CODIGO,
            STATUS,
            PEDIDO_CLIENTE
          `, { count: 'exact' })
          .eq('CENTROCUSTO', 'JAB')
          .gte('DATA_PEDIDO', startOfDay(dateRange.from).toISOString())
          .lte('DATA_PEDIDO', endOfDay(dateRange.to).toISOString())
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (errorPedidos) throw errorPedidos;
        if (!pedidosPage || pedidosPage.length === 0) break;

        allPedidos = [...allPedidos, ...pedidosPage];
        if (!count || allPedidos.length >= count) break;
        
        page++;
      }

      console.log('Total de pedidos encontrados:', allPedidos.length);

      if (allPedidos.length === 0) return [];

      // Buscamos os apelidos das pessoas
      const pessoasIds = [...new Set(allPedidos.map(p => p.PES_CODIGO))];
      const { data: pessoas, error: errorPessoas } = await supabase
        .from('BLUEBAY_PESSOA')
        .select('PES_CODIGO, APELIDO')
        .in('PES_CODIGO', pessoasIds);

      if (errorPessoas) throw errorPessoas;

      // Buscamos as descrições dos itens
      const itemCodigos = [...new Set(allPedidos.map(p => p.ITEM_CODIGO))];
      const { data: itens, error: errorItens } = await supabase
        .from('BLUEBAY_ITEM')
        .select('ITEM_CODIGO, DESCRICAO')
        .in('ITEM_CODIGO', itemCodigos);

      if (errorItens) throw errorItens;

      // Criamos os mapas para lookup rápido
      const apelidoMap = new Map(
        pessoas?.map(p => [p.PES_CODIGO, p.APELIDO]) || []
      );
      const itemMap = new Map(
        itens?.map(i => [i.ITEM_CODIGO, i.DESCRICAO]) || []
      );

      // Agrupamos os pedidos primeiro por PED_NUMPEDIDO, PED_ANOBASE e FILIAL
      const groupedOrders = allPedidos.reduce((acc: { [key: string]: JabOrder }, curr) => {
        const key = `${curr.FILIAL}-${curr.PED_NUMPEDIDO}-${curr.PED_ANOBASE}`;
        
        if (!acc[key]) {
          acc[key] = {
            MATRIZ: curr.MATRIZ,
            FILIAL: curr.FILIAL,
            PED_NUMPEDIDO: curr.PED_NUMPEDIDO,
            PED_ANOBASE: curr.PED_ANOBASE,
            total_saldo: 0,
            valor_total: 0,
            APELIDO: apelidoMap.get(curr.PES_CODIGO) || null,
            PEDIDO_CLIENTE: curr.PEDIDO_CLIENTE,
            STATUS: curr.STATUS,
            items: []
          };
        }
        
        const saldo = curr.QTDE_SALDO || 0;
        const valorUnitario = curr.VALOR_UNITARIO || 0;
        
        acc[key].total_saldo += saldo;
        acc[key].valor_total += saldo * valorUnitario;
        
        // Adiciona o item ao array de items
        if (curr.ITEM_CODIGO) {
          const existingItemIndex = acc[key].items.findIndex(item => item.ITEM_CODIGO === curr.ITEM_CODIGO);
          if (existingItemIndex === -1) {
            acc[key].items.push({
              ITEM_CODIGO: curr.ITEM_CODIGO,
              DESCRICAO: itemMap.get(curr.ITEM_CODIGO) || null,
              QTDE_SALDO: saldo,
              QTDE_PEDIDA: curr.QTDE_PEDIDA || 0,
              QTDE_ENTREGUE: curr.QTDE_ENTREGUE || 0,
              VALOR_UNITARIO: valorUnitario
            });
          }
        }
        
        return acc;
      }, {});

      console.log('Número de pedidos agrupados:', Object.keys(groupedOrders).length);
      const amostraAgrupada = Object.values(groupedOrders)[0];
      if (amostraAgrupada) {
        console.log('Exemplo de pedido agrupado:', {
          numero: amostraAgrupada.PED_NUMPEDIDO,
          quantidadeItens: amostraAgrupada.items.length,
          primeiroItem: amostraAgrupada.items[0]
        });
      }
      
      return Object.values(groupedOrders);
    },
    enabled: !!dateRange?.from && !!dateRange?.to
  });
}
