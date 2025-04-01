
import { supabase } from "@/integrations/supabase/client";

/**
 * Busca dados de faturamento do Bluebay para o período especificado
 */
export async function fetchBluebayFaturamento(startDate: string, endDate: string): Promise<any[]> {
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
      return rpcData;
    }

    // Se não houver dados ou ocorrer um erro, faça uma consulta direta à tabela
    console.log("Tentando consultar diretamente a tabela BLUEBAY_FATURAMENTO...");

    // Se não houver dados ou ocorrer um erro, faça uma consulta direta à tabela
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

    console.log("Amostra direta da tabela BLUEBAY_FATURAMENTO:", tableData);
    console.log("Quantidade de registros na amostra direta:", tableData ? tableData.length : 0);

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

    return fullData || [];
  } catch (error) {
    console.error("Erro ao buscar dados de faturamento:", error);
    throw error;
  }
}
