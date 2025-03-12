
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
  // Note: This calculation is now primarily handled by fetchTitulosVencidos
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

// Função para buscar títulos vencidos diretamente do Supabase
export const fetchTitulosVencidos = async (clienteCodigo: string | number) => {
  try {
    console.log(`Buscando títulos vencidos para cliente ${clienteCodigo}`);
    
    // Format today's date as YYYY-MM-DD for comparison
    const today = new Date().toISOString().split('T')[0];
    
    // Make sure clienteCodigo is converted to string for the query
    const clienteCodigoStr = clienteCodigo.toString();
    
    const { data, error } = await supabase
      .from('BLUEBAY_TITULO')
      .select('VLRSALDO')
      .eq('PES_CODIGO', clienteCodigoStr)
      .lt('DTVENCIMENTO', today)
      .not('VLRSALDO', 'is', null); // Ensure we only get records with non-null VLRSALDO
    
    if (error) {
      console.error("Erro ao buscar títulos vencidos:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log(`Nenhum título vencido encontrado para cliente ${clienteCodigo}`);
      return 0;
    }
    
    console.log(`Encontrados ${data.length} títulos vencidos para cliente ${clienteCodigo}`);
    
    // Calculate the total of overdue values
    const valorVencido = data.reduce((total, titulo) => {
      const saldo = parseFloat(titulo.VLRSALDO) || 0;
      console.log(`Título com VLRSALDO: ${saldo}`);
      return total + saldo;
    }, 0);
    
    console.log(`Total valor vencido para cliente ${clienteCodigo}: ${valorVencido}`);
    
    return valorVencido;
  } catch (error) {
    console.error("Erro ao buscar títulos vencidos:", error);
    return 0;
  }
};
