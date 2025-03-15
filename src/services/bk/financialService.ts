
import { supabase } from "@/integrations/supabase/client";

// Define the types for BkFaturamento and consolidated invoices
export interface BkFaturamento {
  NOTA: string;
  SERIE: string | null;
  DATA_EMISSAO: string | null;
  PES_CODIGO: string | null;
  PED_NUMPEDIDO: string | null;
  VALOR_UNITARIO: number | null;
  QUANTIDADE: number | null;
  ST_CODIGO: string | null;
  CFOP: string | null;
  STATUS: string | null;
  ITEM_CODIGO: string | null;
}

// Fetch BK faturamento data from the database
export const fetchBkFaturamentoData = async (startDate: string, endDate: string) => {
  const { data, error } = await supabase
    .rpc('get_bk_faturamento', { 
      start_date: startDate, 
      end_date: endDate 
    });

  if (error) {
    console.error("Error fetching BK faturamento data:", error);
    throw error;
  }

  return data as BkFaturamento[];
};

// Fetch invoice items for a specific invoice
export const fetchInvoiceItems = async (nota: string) => {
  const { data, error } = await supabase
    .from('BLUEBAY_FATURAMENTO')
    .select('NOTA, QUANTIDADE, VALOR_UNITARIO, ITEM_CODIGO')
    .eq('NOTA', nota);

  if (error) {
    console.error("Error fetching invoice items:", error);
    throw error;
  }

  return data;
};

// Consolidate invoices by NOTA
export const consolidateByNota = async (faturamentos: BkFaturamento[]) => {
  // Create a map to consolidate by NOTA
  const notaMap = new Map();

  // First, process all faturamento items
  for (const faturamento of faturamentos) {
    const { NOTA, QUANTIDADE, VALOR_UNITARIO, ...rest } = faturamento;
    
    if (!notaMap.has(NOTA)) {
      notaMap.set(NOTA, {
        NOTA,
        ITEMS_COUNT: 0,
        VALOR_NOTA: 0,
        ...rest
      });
    }
    
    const notaData = notaMap.get(NOTA);
    
    // Count items
    notaData.ITEMS_COUNT += 1;
    
    // Sum values
    if (QUANTIDADE && VALOR_UNITARIO) {
      notaData.VALOR_NOTA += QUANTIDADE * VALOR_UNITARIO;
    }
  }

  // Get array from map values
  const consolidatedInvoices = Array.from(notaMap.values());

  // Fetch client names for all PES_CODIGO values at once
  const clientCodes = consolidatedInvoices
    .map(invoice => invoice.PES_CODIGO)
    .filter(Boolean) // Remove null values
    .filter((value, index, self) => self.indexOf(value) === index); // Get unique values

  if (clientCodes.length > 0) {
    // Fetch client info including fator_correcao
    const { data: clients, error } = await supabase
      .from('BLUEBAY_PESSOA')
      .select('PES_CODIGO, APELIDO, fator_correcao')
      .in('PES_CODIGO', clientCodes);

    if (error) {
      console.error("Error fetching client data:", error);
    } else if (clients) {
      // Create a map for quick lookup
      const clientMap = new Map();
      clients.forEach(client => {
        clientMap.set(client.PES_CODIGO, {
          CLIENTE_NOME: client.APELIDO,
          fator_correcao: client.fator_correcao
        });
      });

      // Add client names to invoices
      consolidatedInvoices.forEach(invoice => {
        if (invoice.PES_CODIGO && clientMap.has(invoice.PES_CODIGO)) {
          const clientInfo = clientMap.get(invoice.PES_CODIGO);
          invoice.CLIENTE_NOME = clientInfo.CLIENTE_NOME;
          invoice.fator_correcao = clientInfo.fator_correcao;
        }
      });
    }
  }

  return consolidatedInvoices;
};
