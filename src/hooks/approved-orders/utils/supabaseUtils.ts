
import { supabase } from '@/integrations/supabase/client';
import { ApprovedOrder } from '../types';

// Create simple flat types to avoid deep instantiation issues
type SeparacaoItemFlat = {
  pedido: string;
  item_codigo: string | null;
  descricao: string | null;
  quantidade_pedida: number | null;
  quantidade_entregue: number | null;
  quantidade_saldo: number | null;
  valor_unitario: number | null;
  valor_total?: number | null;
};

type SeparacaoFlat = {
  id: string;
  valor_total: number | null;
  quantidade_itens: number | null;
  separacao_itens_flat: SeparacaoItemFlat[] | null;
};

export type StoredClienteData = {
  PES_CODIGO: number;
  APELIDO: string | null;
  volume_saudavel_faturamento: number | null;
  valoresTotais: number;
  valoresEmAberto: number;
  valoresVencidos: number;
  representanteNome: string | null;
  separacoes: SeparacaoFlat[];
};

/**
 * Saves an approved order to Supabase
 */
export const saveToSupabase = async (
  separacaoId: string,
  simplifiedClienteData: StoredClienteData,
  approvedAt: Date,
  userId: string | null,
  userEmail: string | null,
  action: string
) => {
  const { error } = await supabase
    .from('approved_orders')
    .insert({
      separacao_id: separacaoId,
      cliente_data: simplifiedClienteData,
      approved_at: approvedAt.toISOString(),
      user_id: userId,
      user_email: userEmail,
      action: action
    });
    
  if (error) {
    console.error('Error saving to Supabase:', error);
    throw error;
  }
  
  return { success: true };
};

/**
 * Fetches approved orders from Supabase for a specific month and year
 */
export const fetchApprovedOrdersFromSupabase = async (selectedYear: number, selectedMonth: number) => {
  // Format month with leading zero for single-digit months
  const formattedMonth = selectedMonth < 10 ? `0${selectedMonth}` : selectedMonth.toString();
  const startDateStr = `${selectedYear}-${formattedMonth}-01`;
  const endMonthDay = new Date(selectedYear, selectedMonth, 0).getDate();
  const endDateStr = `${selectedYear}-${formattedMonth}-${endMonthDay}`;
  
  console.log(`Buscando aprovações entre ${startDateStr} e ${endDateStr}`);
  
  // Use between dates instead of LIKE pattern for proper type handling
  const { data: supabaseOrders, error } = await supabase
    .from('approved_orders')
    .select('*')
    .gte('approved_at', startDateStr)
    .lte('approved_at', endDateStr)
    .order('approved_at', { ascending: false });
    
  if (error) {
    console.error('Error loading approved orders from Supabase:', error);
    throw error;
  }
  
  return supabaseOrders;
};

/**
 * Converts Supabase orders to ApprovedOrder format
 */
export const processSupabaseOrders = (supabaseOrders: any[]): ApprovedOrder[] => {
  return supabaseOrders.map(order => ({
    separacaoId: order.separacao_id,
    clienteData: order.cliente_data as any, // Use any to break the circular reference
    approvedAt: new Date(order.approved_at),
    userId: order.user_id,
    userEmail: order.user_email,
    action: order.action
  }));
};

/**
 * Creates a simplified version of clienteData for storage
 */
export const createSimplifiedClienteData = (
  clienteData: any, 
  separacaoId: string
): StoredClienteData => {
  // Extract only the needed separacao data
  const relevantSeparacao = clienteData.separacoes.find((sep: any) => sep.id === separacaoId);
  
  // Create flattened version of clienteData for storage
  return {
    PES_CODIGO: clienteData.PES_CODIGO,
    APELIDO: clienteData.APELIDO,
    volume_saudavel_faturamento: clienteData.volume_saudavel_faturamento,
    valoresTotais: clienteData.valoresTotais,
    valoresEmAberto: clienteData.valoresEmAberto,
    valoresVencidos: clienteData.valoresVencidos,
    representanteNome: clienteData.representanteNome,
    separacoes: relevantSeparacao ? [{
      id: relevantSeparacao.id,
      valor_total: relevantSeparacao.valor_total || null,
      quantidade_itens: relevantSeparacao.quantidade_itens || null,
      // Flatten separacao_itens to avoid deep nesting
      separacao_itens_flat: relevantSeparacao.separacao_itens ? 
        relevantSeparacao.separacao_itens.map((item: any) => ({
          pedido: item.pedido,
          item_codigo: item.item_codigo || null,
          descricao: item.descricao || null,
          quantidade_pedida: item.quantidade_pedida || null,
          quantidade_entregue: item.quantidade_entregue || null,
          quantidade_saldo: item.quantidade_saldo || null,
          valor_unitario: item.valor_unitario || null,
          valor_total: item.valor_total || null
        })) : null
    }] : []
  };
};
