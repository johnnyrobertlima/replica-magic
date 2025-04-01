
import { supabase } from "@/integrations/supabase/client";
import { ItemDetail } from "./types";

/**
 * Fetch item details including transaction information for a specific item
 */
export const fetchItemDetails = async (
  itemCode: string, 
  startDate: string, 
  endDate: string
): Promise<ItemDetail[]> => {
  try {
    console.log(`Fetching details for item ${itemCode} between ${startDate} and ${endDate}`);
    
    // Consulta a tabela de faturamento com join para obter nomes de clientes
    const { data, error } = await supabase
      .rpc('get_bluebay_faturamento', { 
        start_date: startDate,
        end_date: endDate + "T23:59:59Z" // Incluir até o fim do dia
      })
      .eq('ITEM_CODIGO', itemCode)
      .order('DATA_EMISSAO', { ascending: false });
    
    if (error) {
      console.error("Error fetching item details:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log(`No details found for item ${itemCode}`);
      return [];
    }
    
    console.log(`Found ${data.length} detail records for item ${itemCode}`);
    
    // Obter os códigos de clientes para buscar os nomes
    const pessoasCodigos = [...new Set(data.map(item => item.PES_CODIGO))].filter(Boolean);
    
    // Buscar informações sobre os clientes
    const clientesMap = new Map();
    if (pessoasCodigos.length > 0) {
      const { data: clientes, error: clientesError } = await supabase
        .from('BLUEBAY_PESSOA')
        .select('PES_CODIGO, APELIDO, fator_correcao')
        .in('PES_CODIGO', pessoasCodigos);
      
      if (clientesError) {
        console.error("Error fetching clients:", clientesError);
      } else if (clientes) {
        clientes.forEach(cliente => {
          clientesMap.set(cliente.PES_CODIGO, {
            CLIENTE_NOME: cliente.APELIDO || 'Cliente Sem Nome',
            FATOR_CORRECAO: cliente.fator_correcao
          });
        });
      }
    }
    
    // Mapear os dados para o formato de retorno esperado
    const detailsWithClientInfo = data.map(item => {
      const clienteInfo = clientesMap.get(item.PES_CODIGO) || {};
      
      return {
        NOTA: item.NOTA || '',
        DATA_EMISSAO: item.DATA_EMISSAO,
        CLIENTE_NOME: clienteInfo.CLIENTE_NOME || 'Cliente Não Identificado',
        PES_CODIGO: item.PES_CODIGO,
        QUANTIDADE: item.QUANTIDADE || 0,
        VALOR_UNITARIO: item.VALOR_UNITARIO || 0,
        FATOR_CORRECAO: clienteInfo.FATOR_CORRECAO || null
      } as ItemDetail;
    });
    
    return detailsWithClientInfo;
  } catch (error) {
    console.error(`Error fetching details for item ${itemCode}:`, error);
    throw error;
  }
};
