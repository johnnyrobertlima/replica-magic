
import { ClientInfo, ConsolidatedInvoice, FinancialTitle } from "../types/financialTypes";
import { fetchClientData } from "../utils/clientDataUtils";
import { createConsolidatedInvoice, updateInvoiceWithTitles } from "../utils/invoiceUtils";
import { processFinancialTitle } from "../utils/titleUtils";

/**
 * Processa títulos financeiros adicionando informações de cliente
 */
export const processTitles = async (titulos: any[]) => {
  try {
    if (!titulos || titulos.length === 0) {
      return [];
    }
    
    // Collect all unique client codes for these titles
    const clienteCodigos = [...new Set(
      titulos.map(titulo => 
        typeof titulo.PES_CODIGO === 'string' ? 
          titulo.PES_CODIGO : String(titulo.PES_CODIGO)
      )
    )].filter(Boolean) as Array<string | number>;
    
    console.info(`Encontrados ${clienteCodigos.length} códigos de clientes únicos`);
    
    // Fetch client data
    const clientesMap = await fetchClientData(clienteCodigos);
    
    if (!clientesMap) {
      console.warn("Não foi possível buscar dados dos clientes - usando nomes vazios");
    }
    
    // Process titles with client names
    const processedTitles = titulos.map(titulo => 
      processFinancialTitle(titulo, clientesMap || {})
    );
    
    return {
      processedTitles,
      clientesMap: clientesMap || {},
      uniqueStatuses: [...new Set(processedTitles.map(title => title.STATUS || "").filter(Boolean))]
    };
  } catch (error) {
    console.error("Erro ao processar títulos:", error);
    throw error;
  }
};

/**
 * Processa dados de faturamento e cria invoices consolidadas
 */
export const processInvoices = (
  faturamento: any[],
  clientesMap: Record<string | number, ClientInfo>,
  titulos: FinancialTitle[]
): ConsolidatedInvoice[] => {
  try {
    const consolidatedData: ConsolidatedInvoice[] = [];
    
    if (!faturamento || faturamento.length === 0) {
      return consolidatedData;
    }
    
    // Criar invoices consolidadas
    for (const item of faturamento) {
      try {
        const invoice = createConsolidatedInvoice(item, clientesMap);
        
        // Find corresponding titles for this invoice
        const matchingTitles = titulos.filter(titulo => 
          String(titulo.NUMNOTA) === String(item.NOTA)) || [];
        
        // Set due date of the title if available
        if (matchingTitles.length > 0) {
          invoice.DATA_VENCIMENTO = matchingTitles[0].DTVENCIMENTO || 
            matchingTitles[0].DTVENCTO || null;
        }
        
        consolidatedData.push(invoice);
      } catch (err) {
        console.error(`Erro ao processar faturamento ${item.NOTA}:`, err);
      }
    }
    
    // Update invoice values based on related titles
    for (const titulo of titulos) {
      try {
        // Find the related invoice
        const invoice = consolidatedData.find(inv => 
          String(inv.NOTA) === String(titulo.NUMNOTA));
        
        if (invoice) {
          updateInvoiceWithTitles(invoice, titulo);
        }
      } catch (err) {
        console.error(`Erro ao atualizar faturamento com título ${titulo.NUMNOTA}:`, err);
      }
    }
    
    return consolidatedData;
  } catch (error) {
    console.error("Erro ao processar invoices:", error);
    return [];
  }
};
