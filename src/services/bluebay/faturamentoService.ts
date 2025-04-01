
import { supabase } from "@/integrations/supabase/client";

// Define a specific return type for the function
interface BluebayFaturamentoItem {
  MATRIZ: number;
  FILIAL: number;
  ID_EF_DOCFISCAL?: number;
  ID_EF_DOCFISCAL_ITEM?: number;
  PED_ANOBASE?: number;
  MPED_NUMORDEM?: number;
  PES_CODIGO?: number;
  TRANSACAO?: number;
  QUANTIDADE?: number;
  VALOR_UNITARIO?: number;
  VALOR_DESCONTO?: number;
  VALOR_NOTA?: number;
  DATA_EMISSAO?: string | Date;
  PED_NUMPEDIDO?: string;
  ITEM_CODIGO?: string;
  TIPO?: string;
  NOTA?: string;
  STATUS?: string;
  CENTROCUSTO?: string;
  [key: string]: any; // Allow for any additional properties
}

/**
 * Busca dados de faturamento do Bluebay para o período especificado
 */
export async function fetchBluebayFaturamento(startDate: string, endDate: string): Promise<BluebayFaturamentoItem[]> {
  // Converter datas para formato ISO
  const startIso = new Date(startDate).toISOString();
  const endIso = `${new Date(endDate).toISOString().split('T')[0]}T23:59:59Z`;
  
  console.log("Buscando dados de faturamento com função RPC:", { startDate: startIso, endDate: endIso });

  try {
    // Tentar chamar a função RPC
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_bluebay_faturamento', {
        start_date: startIso,
        end_date: endIso
      });

    console.log("Aplicando filtro de data:", !!startDate && !!endDate);
    
    if (rpcError) {
      console.error("Erro na função RPC:", rpcError);
      throw rpcError;
    }

    if (rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
      console.log("Dados retornados da função RPC:", rpcData);
      console.log("Quantidade de registros retornados:", rpcData.length);
      return rpcData as BluebayFaturamentoItem[];
    }

    // Consulta direta à tabela para amostra
    const { data: tableData, error: tableError } = await supabase
      .from("BLUEBAY_FATURAMENTO")
      .select("*")
      .eq("CENTROCUSTO", "BLUEBAY")
      .gte("DATA_EMISSAO", startIso)
      .lte("DATA_EMISSAO", endIso)
      .limit(5);

    if (tableError) {
      console.error("Erro na consulta à tabela:", tableError);
      throw tableError;
    }

    // Log da amostra para debug
    if (tableData) {
      console.log("Amostra direta da tabela BLUEBAY_FATURAMENTO:", tableData);
      console.log("Quantidade de registros na amostra direta:", tableData.length);
    }

    // Consultar a tabela completa com filtros
    const { data: fullData, error: fullError } = await supabase
      .from("BLUEBAY_FATURAMENTO")
      .select("*")
      .eq("CENTROCUSTO", "BLUEBAY")
      .gte("DATA_EMISSAO", startIso)
      .lte("DATA_EMISSAO", endIso);

    if (fullError) {
      console.error("Erro na consulta completa à tabela:", fullError);
      throw fullError;
    }

    return fullData as BluebayFaturamentoItem[] || [];
  } catch (error) {
    console.error("Erro ao buscar dados de faturamento:", error);
    throw error;
  }
}
