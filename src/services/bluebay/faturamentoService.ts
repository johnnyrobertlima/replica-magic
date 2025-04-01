
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

// Definir uma interface específica para evitar problemas de tipo excessivamente profundo
export interface BluebayFaturamentoItem {
  MATRIZ: number;
  FILIAL: number;
  ID_EF_DOCFISCAL: number;
  ID_EF_DOCFISCAL_ITEM: number;
  PED_ANOBASE?: number;
  MPED_NUMORDEM?: number;
  PES_CODIGO?: number;
  TRANSACAO?: number;
  QUANTIDADE?: number;
  VALOR_UNITARIO?: number;
  VALOR_DESCONTO?: number;
  VALOR_NOTA?: number;
  DATA_EMISSAO?: string;
  PED_NUMPEDIDO?: string;
  ITEM_CODIGO?: string;
  TIPO?: string;
  NOTA?: string;
  STATUS?: string;
}

interface FaturamentoFilter {
  startDate?: string;
  endDate?: string;
}

export const fetchBluebayFaturamento = async (
  startDate?: string,
  endDate?: string
): Promise<BluebayFaturamentoItem[]> => {
  try {
    console.log("Buscando dados de faturamento com função RPC:", {
      startDate,
      endDate
    });

    const filter: FaturamentoFilter = {};

    // Validar se as datas foram fornecidas
    if (startDate && endDate) {
      // Formatar datas para o banco de dados
      filter.startDate = startDate;
      filter.endDate = endDate + "T23:59:59Z"; // Incluir até o fim do dia
      console.log("Aplicando filtro de data:", true);
    }

    // Utilizar o procedimento RPC get_bluebay_faturamento que está no banco de dados
    // Este procedimento faz a junção entre BLUEBAY_FATURAMENTO e BLUEBAY_PEDIDO
    // e aplica o filtro CENTROCUSTO = 'BLUEBAY'
    const { data, error } = await supabase
      .rpc('get_bluebay_faturamento', { 
        start_date: filter.startDate, 
        end_date: filter.endDate 
      });

    if (error) {
      console.error("Erro ao chamar função RPC:", error);
      throw error;
    }

    console.info(`Buscados ${data?.length || 0} registros de faturamento para CENTROCUSTO = BLUEBAY`);
    return data || [];
  } catch (error) {
    console.error("Erro ao buscar dados de faturamento:", error);
    throw error;
  }
};
