
import { supabase } from "@/integrations/supabase/client";
import { ClienteFinanceiro, TituloFinanceiro } from "@/types/financialClient";

// Get separações pendentes
export const getSeparacoesPendentes = (separacoes: any[], hiddenCards: Set<string>) => {
  const pendentes = separacoes
    .filter(sep => sep.status === 'pendente')
    .filter(sep => !hiddenCards.has(sep.id));
  
  return pendentes;
};

// Get unique client codes
export const getClientesCodigos = (sepPendentes: any[]) => {
  const codigos = sepPendentes
    .map(sep => sep.cliente_codigo)
    .filter((value, index, self) => self.indexOf(value) === index);
  
  return codigos;
};

// Update volume saudavel
export const updateVolumeSaudavel = async (clienteCodigo: number, valor: number) => {
  try {
    const { error } = await supabase
      .from('BLUEBAY_PESSOA')
      .update({ volume_saudavel_faturamento: valor })
      .eq('PES_CODIGO', clienteCodigo);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar volume saudável:", error);
    return { success: false, error };
  }
};

// Calculate financial values for a client
export const calculateClientFinancialValues = (
  cliente: ClienteFinanceiro, 
  titulo: TituloFinanceiro,
  today: Date
) => {
  const pesCodigoNumerico = typeof titulo.PES_CODIGO === 'string' 
    ? parseInt(titulo.PES_CODIGO, 10) 
    : titulo.PES_CODIGO;
  
  if (isNaN(pesCodigoNumerico) || cliente.PES_CODIGO !== pesCodigoNumerico) return cliente;

  // Total values = VLRTITULO - VLRDESCONTO - VLRABATIMENTO
  const valorTotal = (titulo.VLRTITULO || 0) - (titulo.VLRDESCONTO || 0) - (titulo.VLRABATIMENTO || 0);
  cliente.valoresTotais += valorTotal;
  
  // Open values = VLRSALDO
  cliente.valoresEmAberto += (titulo.VLRSALDO || 0);
  
  // Overdue values = VLRSALDO of overdue titles
  if (titulo.DTVENCIMENTO) {
    const vencimento = new Date(titulo.DTVENCIMENTO);
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Ajusta a data de vencimento para remover o horário
    const vencimentoDateOnly = new Date(vencimento.getFullYear(), vencimento.getMonth(), vencimento.getDate());
    
    // Compara apenas as datas (sem horas)
    if (vencimentoDateOnly < todayDateOnly) {
      cliente.valoresVencidos += (titulo.VLRSALDO || 0);
    }
  }

  return cliente;
};

// Function to fetch overdue titles directly from Supabase
export const fetchTitulosVencidos = async (clienteCodigo: number | string): Promise<number> => {
  try {
    // Ensure clienteCodigo is a string as expected by the database
    const clienteCodigoStr = String(clienteCodigo);
    console.log(`Buscando títulos vencidos para cliente ${clienteCodigoStr}`);
    
    // Method 1: Using RPC function (faster, more reliable)
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('calcular_valor_vencido', {
        cliente_codigo: clienteCodigoStr
      });
    
    if (rpcError) {
      console.error("Erro ao buscar títulos vencidos via RPC:", rpcError);
      
      // Fallback method: Direct query (as backup)
      const today = new Date().toISOString().split('T')[0];
      console.log(`Usando consulta direta com data: ${today}`);
      
      const { data, error } = await supabase
        .from('BLUEBAY_TITULO')
        .select('VLRSALDO')
        .eq('PES_CODIGO', clienteCodigoStr)
        .lt('DTVENCIMENTO', today)
        .not('VLRSALDO', 'is', null);
      
      if (error) {
        console.error("Erro ao buscar títulos vencidos via consulta direta:", error);
        return 0;
      }
      
      if (!data || data.length === 0) {
        console.log(`Nenhum título vencido encontrado para cliente ${clienteCodigoStr}`);
        return 0;
      }
      
      // Sum all overdue values
      const valorVencido = data.reduce((total, titulo) => {
        const saldo = typeof titulo.VLRSALDO === 'string' 
          ? parseFloat(titulo.VLRSALDO) 
          : (titulo.VLRSALDO || 0);
        return total + saldo;
      }, 0);
      
      console.log(`Total valor vencido (consulta direta) para cliente ${clienteCodigoStr}: ${valorVencido}`);
      return valorVencido;
    }
    
    // Process RPC result
    const valorVencido = rpcData && rpcData.length > 0 ? Number(rpcData[0].total_vlr_saldo) || 0 : 0;
    console.log(`Total valor vencido para cliente ${clienteCodigoStr}: ${valorVencido}`);
    
    return valorVencido;
  } catch (error) {
    console.error("Erro ao buscar títulos vencidos:", error);
    return 0;
  }
};
