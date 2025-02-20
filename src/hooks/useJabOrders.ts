
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

      const { data, error } = await supabase
        .from('BLUEBAY_PEDIDO')
        .select(`
          MATRIZ,
          FILIAL,
          PED_NUMPEDIDO,
          PED_ANOBASE,
          QTDE_SALDO,
          VALOR_UNITARIO,
          PES_CODIGO,
          BLUEBAY_PESSOA!BLUEBAY_PEDIDO_PES_CODIGO_fkey (
            APELIDO
          )
        `)
        .in('STATUS', ['0', '1', '2'])
        .gte('DATA_PEDIDO', startOfDay(selectedDate).toISOString())
        .lte('DATA_PEDIDO', endOfDay(selectedDate).toISOString());

      if (error) throw error;

      console.log('Dados brutos do banco:', data);

      // Agrupa os pedidos apenas por PED_NUMPEDIDO e PED_ANOBASE
      const groupedOrders = data.reduce((acc: { [key: string]: JabOrder }, curr) => {
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
            APELIDO: curr.BLUEBAY_PESSOA?.APELIDO || null
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
