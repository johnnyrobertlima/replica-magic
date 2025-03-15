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
  
  const { data, error } = await supabase.rpc('get_bk_faturamento', {
    start_date: startDate,
    end_date: endDate
  });

  if (error) {
    console.error("Error fetching B&K faturamento data:", error);
    throw error;
  }

  console.log(`Fetched ${data?.length || 0} faturamento records`);
  
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
  const invoiceMap = new Map<string, ConsolidatedInvoice>();
  
  data.forEach(item => {
    if (!item.NOTA) return;
    
    const itemValue = (item.QUANTIDADE || 0) * (item.VALOR_UNITARIO || 0);
    
    const existingInvoice = invoiceMap.get(item.NOTA);
    
    if (existingInvoice) {
      existingInvoice.ITEMS_COUNT += 1;
      existingInvoice.VALOR_NOTA = (existingInvoice.VALOR_NOTA || 0) + itemValue;
    } else {
      const clienteInfo = (item as any).CLIENTE_INFO;
      const clienteNome = clienteInfo ? 
        (clienteInfo.APELIDO || clienteInfo.RAZAOSOCIAL || null) : null;
      const fatorCorrecao = clienteInfo ? clienteInfo.FATOR_CORRECAO : null;
      
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
  
  return Array.from(invoiceMap.values());
};
