
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay } from "date-fns";

interface JabOrder {
  MATRIZ: number;
  FILIAL: number;
  PED_NUMPEDIDO: string;
  PED_ANOBASE: number;
  total_saldo: number;
  valor_total: number;
  APELIDO: string | null;
}

export function useJabOrders(selectedDate?: Date) {
  return useQuery({
    queryKey: ['jab-orders', selectedDate?.toISOString()],
    queryFn: async () => {
      if (!selectedDate) return [];

      // First, get orders
      const { data: orders, error } = await supabase
        .from('BLUEBAY_PEDIDO')
        .select(`
          MATRIZ,
          FILIAL,
          PED_NUMPEDIDO,
          PED_ANOBASE,
          QTDE_SALDO,
          VALOR_UNITARIO,
          PES_CODIGO
        `)
        .eq('STATUS', '0')
        .gte('DATA_PEDIDO', startOfDay(selectedDate).toISOString())
        .lte('DATA_PEDIDO', endOfDay(selectedDate).toISOString());

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      console.log('Pedidos encontrados:', orders);

      if (!orders || orders.length === 0) {
        return [];
      }

      // Get unique PES_CODIGO values
      const pessoaCodigos = [...new Set(orders.map(order => order.PES_CODIGO))];

      // Get pessoas data
      const { data: pessoas, error: pessoasError } = await supabase
        .from('BLUEBAY_PESSOA')
        .select('PES_CODIGO, APELIDO')
        .in('PES_CODIGO', pessoaCodigos);

      if (pessoasError) {
        console.error('Error fetching pessoas:', pessoasError);
        throw pessoasError;
      }

      console.log('Pessoas encontradas:', pessoas);

      // Create a lookup map for pessoas
      const pessoaMap = new Map(
        pessoas?.map(p => [p.PES_CODIGO, p.APELIDO]) || []
      );

      // Agrupa os pedidos apenas por PED_NUMPEDIDO e PED_ANOBASE
      const groupedOrders = orders.reduce((acc: { [key: string]: JabOrder }, curr) => {
        const key = `${curr.PED_NUMPEDIDO}-${curr.PED_ANOBASE}`;
        console.log('Processando pedido:', key, curr);
        
        if (!acc[key]) {
          acc[key] = {
            MATRIZ: curr.MATRIZ,
            FILIAL: curr.FILIAL,
            PED_NUMPEDIDO: curr.PED_NUMPEDIDO,
            PED_ANOBASE: curr.PED_ANOBASE,
            total_saldo: 0,
            valor_total: 0,
            APELIDO: pessoaMap.get(curr.PES_CODIGO) || null
          };
        }
        
        // Soma o saldo e o valor total
        const saldo = curr.QTDE_SALDO || 0;
        const valorUnitario = curr.VALOR_UNITARIO || 0;
        
        acc[key].total_saldo += saldo;
        acc[key].valor_total += saldo * valorUnitario;
        
        console.log('Acumulado para o pedido:', key, acc[key]);
        
        return acc;
      }, {});

      const result = Object.values(groupedOrders);
      console.log('Resultado final agrupado:', result);

      return result;
    },
    enabled: !!selectedDate
  });
}
