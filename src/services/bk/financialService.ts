
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type BkFaturamento = Database["public"]["Tables"]["BLUEBAY_FATURAMENTO"]["Row"];

interface ConsolidatedInvoice {
  NOTA: string;
  DATA_EMISSAO: string | null;
  PES_CODIGO: number | null;
  STATUS: string | null;
  VALOR_NOTA: number | null;
  ITEMS_COUNT: number;
  CLIENTE_NOME?: string | null;
  FATOR_CORRECAO?: number | null;
}

interface InvoiceItem {
  NOTA: string;
  ITEM_CODIGO: string | null;
  QUANTIDADE: number | null;
  VALOR_UNITARIO: number | null;
  TIPO: string | null;
  PES_CODIGO: number | null;
  FATOR_CORRECAO?: number | null;
}

export const fetchBkFaturamentoData = async (
  startDate?: string,
  endDate?: string
): Promise<BkFaturamento[]> => {
  console.log("Fetching B&K faturamento data...", { startDate, endDate });
  
  // Use the RPC function to get filtered data with joins
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_bk_faturamento', {
    start_date: startDate,
    end_date: endDate
  });

  if (rpcError) {
    console.error("Error fetching B&K faturamento data via RPC:", rpcError);
    
    // Fallback to direct query on the BLUEBAY_FATURAMENTO table if RPC fails
    const query = supabase
      .from('BLUEBAY_FATURAMENTO')
      .select('*');
    
    if (startDate) {
      query.gte('DATA_EMISSAO', startDate);
    }
    
    if (endDate) {
      query.lte('DATA_EMISSAO', endDate);
    }
    
    const { data: fallbackData, error: fallbackError } = await query;
    
    if (fallbackError) {
      console.error("Error in fallback query:", fallbackError);
      throw fallbackError;
    }
    
    console.log(`Fetched ${fallbackData?.length || 0} faturamento records via fallback`);
    return processFaturamentoData(fallbackData || []);
  }

  console.log(`Fetched ${rpcData?.length || 0} faturamento records via RPC`);
  return processFaturamentoData(rpcData || []);
};

const processFaturamentoData = async (data: BkFaturamento[]): Promise<BkFaturamento[]> => {
  const filteredData = data?.filter(item => item.TIPO === 'S') || [];
  console.log(`Filtered to ${filteredData.length} records with TIPO = 'S'`);
  
  if (filteredData.length > 0) {
    const clienteIds = filteredData
      .map(item => item.PES_CODIGO)
      .filter((id): id is number => id !== null && !isNaN(Number(id)));
    
    if (clienteIds.length > 0) {
      const { data: clientesData, error: clientesError } = await supabase
        .from('BLUEBAY_PESSOA')
        .select('PES_CODIGO, APELIDO, RAZAOSOCIAL, fator_correcao')
        .in('PES_CODIGO', clienteIds);
      
      if (!clientesError && clientesData) {
        const clienteMap = new Map<number, { 
          APELIDO: string | null, 
          RAZAOSOCIAL: string | null,
          FATOR_CORRECAO: number | null 
        }>();
        
        clientesData.forEach(cliente => {
          clienteMap.set(cliente.PES_CODIGO, {
            APELIDO: cliente.APELIDO,
            RAZAOSOCIAL: cliente.RAZAOSOCIAL,
            FATOR_CORRECAO: cliente.fator_correcao
          });
        });
        
        filteredData.forEach(item => {
          if (item.PES_CODIGO !== null) {
            const clienteInfo = clienteMap.get(item.PES_CODIGO);
            if (clienteInfo) {
              (item as any).CLIENTE_INFO = clienteInfo;
              (item as any).FATOR_CORRECAO = clienteInfo.FATOR_CORRECAO; // Adiciona o fator de correção diretamente no item
            }
          }
        });
      }
    }
  }
  
  return filteredData;
};

export const fetchInvoiceItems = async (nota: string): Promise<InvoiceItem[]> => {
  console.log("Fetching invoice items for nota:", nota);
  
  // Query all items for this invoice
  const { data, error } = await supabase
    .from('BLUEBAY_FATURAMENTO')
    .select('NOTA, ITEM_CODIGO, QUANTIDADE, VALOR_UNITARIO, TIPO, PES_CODIGO')
    .eq('NOTA', nota)
    .eq('TIPO', 'S');
  
  if (error) {
    console.error("Error fetching invoice items:", error);
    throw error;
  }
  
  console.log(`Fetched ${data?.length} items for nota ${nota}`);

  const items: InvoiceItem[] = data || [];

  // Get client correction factor if available
  if (items.length > 0 && items[0].PES_CODIGO) {
    const pesCode = items[0].PES_CODIGO;
    const { data: clienteData, error: clienteError } = await supabase
      .from('BLUEBAY_PESSOA')
      .select('fator_correcao')
      .eq('PES_CODIGO', pesCode)
      .single();

    if (!clienteError && clienteData) {
      const fatorCorrecao = clienteData.fator_correcao;
      items.forEach(item => {
        item.FATOR_CORRECAO = fatorCorrecao;
      });
    }
  }
  
  return items;
};

export const consolidateByNota = (data: BkFaturamento[]): ConsolidatedInvoice[] => {
  console.log(`Consolidating ${data.length} items by NOTA`);
  const invoiceMap = new Map<string, ConsolidatedInvoice>();
  
  data.forEach(item => {
    if (!item.NOTA) return;
    
    // Obtém o fator de correção do cliente (se disponível)
    const clienteInfo = (item as any).CLIENTE_INFO;
    const fatorCorrecao = clienteInfo?.FATOR_CORRECAO || null;
    
    // Aplica o fator de correção ao valor unitário se existir e for maior que 0
    const valorUnitario = item.VALOR_UNITARIO || 0;
    const valorUnitarioAjustado = (fatorCorrecao && fatorCorrecao > 0) 
      ? valorUnitario * fatorCorrecao 
      : valorUnitario;
    
    // Calcula o valor do item com o fator de correção aplicado
    const itemValue = (item.QUANTIDADE || 0) * valorUnitarioAjustado;
    
    const existingInvoice = invoiceMap.get(item.NOTA);
    
    if (existingInvoice) {
      existingInvoice.ITEMS_COUNT += 1;
      existingInvoice.VALOR_NOTA = (existingInvoice.VALOR_NOTA || 0) + itemValue;
    } else {
      const clienteNome = clienteInfo ? 
        (clienteInfo.APELIDO || clienteInfo.RAZAOSOCIAL || null) : null;
      
      invoiceMap.set(item.NOTA, {
        NOTA: item.NOTA,
        DATA_EMISSAO: item.DATA_EMISSAO ? new Date(item.DATA_EMISSAO).toISOString() : null,
        PES_CODIGO: item.PES_CODIGO,
        STATUS: item.STATUS,
        VALOR_NOTA: itemValue,
        ITEMS_COUNT: 1,
        CLIENTE_NOME: clienteNome,
        FATOR_CORRECAO: fatorCorrecao
      });
    }
  });
  
  console.log(`Consolidated into ${invoiceMap.size} invoices`);
  return Array.from(invoiceMap.values());
};
