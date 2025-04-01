
import { supabase } from '@/integrations/supabase/client';
import { EstoqueItem } from '@/types/bk/estoque';

export const reportsService = {
  async getReportItems(): Promise<EstoqueItem[]> {
    console.info('Fetching report items with CENTROCUSTO = BLUEBAY');
    
    // First try to get items with CENTROCUSTO = BLUEBAY
    const { data: bluebayItems, error: bluebayError } = await supabase
      .from('BLUEBAY_PEDIDO')
      .select(`
        ITEM_CODIGO,
        BLUEBAY_ITEM!inner(DESCRICAO, GRU_DESCRICAO)
      `)
      .eq('CENTROCUSTO', 'BLUEBAY')
      .limit(1000);
      
    if (bluebayError) {
      console.error('Error fetching BLUEBAY items:', bluebayError);
      throw bluebayError;
    }
    
    console.info(`Found ${bluebayItems?.length || 0} items with CENTROCUSTO = BLUEBAY`);
    
    // Format the data to match EstoqueItem structure
    const formattedItems: EstoqueItem[] = (bluebayItems || []).map(item => ({
      ITEM_CODIGO: item.ITEM_CODIGO,
      DESCRICAO: item.BLUEBAY_ITEM?.DESCRICAO || '',
      FISICO: 0, // Default values since these might not be available
      DISPONIVEL: 0,
      RESERVADO: 0,
      LOCAL: 0,
      SUBLOCAL: '',
      GRU_DESCRICAO: item.BLUEBAY_ITEM?.GRU_DESCRICAO || '',
    }));

    return formattedItems;
  },
};
