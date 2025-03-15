
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

export const fetchBkFaturamentoData = async (
  startDate?: string,
  endDate?: string
): Promise<BkFaturamento[]> => {
  console.log("Fetching B&K faturamento data...", { startDate, endDate });
  
  // Use the get_bk_faturamento function to get invoices with correct join
  const { data, error } = await supabase.rpc('get_bk_faturamento', {
    start_date: startDate,
    end_date: endDate
  });

  if (error) {
    console.error("Error fetching B&K faturamento data:", error);
    throw error;
  }

  console.log(`Fetched ${data?.length || 0} faturamento records`);
  
  // Filter to only include items with TIPO = 'S'
  const filteredData = data?.filter(item => item.TIPO === 'S') || [];
  console.log(`Filtered to ${filteredData.length} records with TIPO = 'S'`);
  
  // Let's separately get the cliente names and correction factors
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
        // Create a map of cliente IDs to their names and correction factors
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
        
        // Attach cliente info to each faturamento record
        filteredData.forEach(item => {
          if (item.PES_CODIGO !== null) {
            const clienteInfo = clienteMap.get(item.PES_CODIGO);
            if (clienteInfo) {
              // Adding cliente info to the faturamento item
              (item as any).CLIENTE_INFO = clienteInfo;
            }
          }
        });
      }
    }
  }
  
  return filteredData;
};

export const fetchInvoiceItems = async (nota: string): Promise<any[]> => {
  console.log("Fetching invoice items for nota:", nota);
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

  // If we have items, get the correction factor for the client
  if (data && data.length > 0 && data[0].PES_CODIGO) {
    const pesCode = data[0].PES_CODIGO;
    const { data: clienteData, error: clienteError } = await supabase
      .from('BLUEBAY_PESSOA')
      .select('fator_correcao')
      .eq('PES_CODIGO', pesCode)
      .single();

    if (!clienteError && clienteData) {
      const fatorCorrecao = clienteData.fator_correcao;
      // Add correction factor to each item
      data.forEach(item => {
        item.FATOR_CORRECAO = fatorCorrecao;
      });
    }
  }
  
  return data || [];
};

export const consolidateByNota = (data: BkFaturamento[]): ConsolidatedInvoice[] => {
  const invoiceMap = new Map<string, ConsolidatedInvoice>();
  
  data.forEach(item => {
    if (!item.NOTA) return;
    
    // Calculate the item value as QUANTIDADE * VALOR_UNITARIO
    const itemValue = (item.QUANTIDADE || 0) * (item.VALOR_UNITARIO || 0);
    
    const existingInvoice = invoiceMap.get(item.NOTA);
    
    if (existingInvoice) {
      // Update the existing invoice
      existingInvoice.ITEMS_COUNT += 1;
      // Add the calculated item value to the invoice total
      existingInvoice.VALOR_NOTA = (existingInvoice.VALOR_NOTA || 0) + itemValue;
    } else {
      // Get cliente name and correction factor if available
      const clienteInfo = (item as any).CLIENTE_INFO;
      const clienteNome = clienteInfo ? 
        (clienteInfo.APELIDO || clienteInfo.RAZAOSOCIAL || null) : null;
      const fatorCorrecao = clienteInfo ? clienteInfo.FATOR_CORRECAO : null;
      
      // Create a new invoice entry with the calculated value
      invoiceMap.set(item.NOTA, {
        NOTA: item.NOTA,
        DATA_EMISSAO: item.DATA_EMISSAO ? new Date(item.DATA_EMISSAO).toISOString() : null,
        PES_CODIGO: item.PES_CODIGO,
        STATUS: item.STATUS,
        VALOR_NOTA: itemValue,  // Use the calculated value
        ITEMS_COUNT: 1,
        CLIENTE_NOME: clienteNome,
        FATOR_CORRECAO: fatorCorrecao
      });
    }
  });
  
  return Array.from(invoiceMap.values());
};
