
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
}

export function useJabOrders(dateRange?: DayPickerDateRange) {
  return useQuery({
    queryKey: ['jab-orders', dateRange?.from?.toISOString(), dateRange?.to?.toISOString()],
    queryFn: async () => {
      if (!dateRange?.from || !dateRange?.to) return [];

      // Primeiro, buscamos os pedidos
      const { data: pedidos, error: errorPedidos } = await supabase
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
        .in('STATUS', ['1', '2'])
        .eq('CENTROCUSTO', 'JAB')
        .gte('DATA_PEDIDO', startOfDay(dateRange.from).toISOString())
        .lte('DATA_PEDIDO', endOfDay(dateRange.to).toISOString());

      if (errorPedidos) throw errorPedidos;
      if (!pedidos) return [];

      // Em seguida, buscamos os apelidos das pessoas
      const pessoasIds = [...new Set(pedidos.map(p => p.PES_CODIGO))];
      const { data: pessoas, error: errorPessoas } = await supabase
        .from('BLUEBAY_PESSOA')
        .select('PES_CODIGO, APELIDO')
        .in('PES_CODIGO', pessoasIds);

      if (errorPessoas) throw errorPessoas;

      // Criamos um mapa de PES_CODIGO para APELIDO
      const apelidoMap = new Map(
        pessoas?.map(p => [p.PES_CODIGO, p.APELIDO]) || []
      );

      // Agora processamos os dados combinando as informações
      const groupedOrders = pedidos.reduce((acc: { [key: string]: JabOrder }, curr) => {
        const key = `${curr.PED_NUMPEDIDO}-${curr.PED_ANOBASE}`;
        
        if (!acc[key]) {
          acc[key] = {
            MATRIZ: curr.MATRIZ,
            FILIAL: curr.FILIAL,
            PED_NUMPEDIDO: curr.PED_NUMPEDIDO,
            PED_ANOBASE: curr.PED_ANOBASE,
            total_saldo: 0,
            valor_total: 0,
            APELIDO: apelidoMap.get(curr.PES_CODIGO) || null
          };
        }
        
        const saldo = curr.QTDE_SALDO || 0;
        const valorUnitario = curr.VALOR_UNITARIO || 0;
        
        acc[key].total_saldo += saldo;
        acc[key].valor_total += saldo * valorUnitario;
        
        return acc;
      }, {});

      return Object.values(groupedOrders);
    },
    enabled: !!dateRange?.from && !!dateRange?.to
  });
}
