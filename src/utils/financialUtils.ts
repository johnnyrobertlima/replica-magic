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
  // Note: This calculation is now handled by direct database query in fetchTitulosVencidos
  // We keep this logic for legacy compatibility but it won't affect the final value
  if (titulo.DTVENCIMENTO) {
    const vencimento = new Date(titulo.DTVENCIMENTO);
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Ajusta a data de vencimento para remover o horário
    const vencimentoDateOnly = new Date(vencimento.getFullYear(), vencimento.getMonth(), vencimento.getDate());
    
    // Compara apenas as datas (sem horas)
    if (vencimentoDateOnly < todayDateOnly) {
      // This value will be overwritten by the fetchTitulosVencidos function
      // We're keeping the logic here for reference and debugging purposes
      cliente.valoresVencidos += (titulo.VLRSALDO || 0);
    }
  }

  return cliente;
};

// Função para buscar títulos vencidos diretamente do Supabase
export const fetchTitulosVencidos = async (clienteCodigo: string | number) => {
  try {
    const clienteCodigoStr = clienteCodigo.toString();
    console.log(`Executando busca de títulos vencidos para cliente ${clienteCodigoStr}`);
    
    const { data, error, count } = await supabase
      .from('BLUEBAY_TITULO')
      .select('VLRSALDO', { count: 'exact' })
      .eq('PES_CODIGO', clienteCodigoStr)
      .lt('DTVENCIMENTO', new Date().toISOString().split('T')[0]);
    
    if (error) {
      console.error("Erro ao buscar títulos vencidos:", error);
      throw error;
    }
    
    console.log(`Encontrados ${count} títulos vencidos para cliente ${clienteCodigoStr}`);
    console.log(`Dados dos títulos:`, data);
    
    const valorVencido = data.reduce((total, titulo) => {
      const valor = parseFloat(titulo.VLRSALDO) || 0;
      console.log(`Valor saldo: ${valor}`);
      return total + valor;
    }, 0);
    
    console.log(`Total valor vencido para cliente ${clienteCodigoStr}: ${valorVencido}`);
    
    return valorVencido;
  } catch (error) {
    console.error("Erro ao buscar títulos vencidos:", error);
    return 0;
  }
};
