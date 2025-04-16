import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Exports items to Excel based on current filters
 * @param searchTerm Search term to filter items
 * @param groupFilter Group filter
 * @param empresaFilter Empresa filter
 * @returns Promise with the number of exported items
 */
export const exportItemsToExcel = async (
  searchTerm: string, 
  groupFilter: string | string[], 
  empresaFilter: string
): Promise<number> => {
  try {
    console.log("Exporting items to Excel with filters:", {
      searchTerm,
      groupFilter,
      empresaFilter
    });

    // Start building our query
    let query = supabase
      .from("BLUEBAY_ITEM")
      .select("*")
      .eq("ativo", true); // Only fetch active items

    // Apply filters
    if (searchTerm) {
      query = query.or(`ITEM_CODIGO.ilike.%${searchTerm}%,DESCRICAO.ilike.%${searchTerm}%,CODIGOAUX.ilike.%${searchTerm}%`);
    }

    // Apply group filter
    if (groupFilter && groupFilter !== "all") {
      if (Array.isArray(groupFilter) && groupFilter.length > 0) {
        query = query.in("GRU_CODIGO", groupFilter);
      } else if (typeof groupFilter === "string") {
        query = query.eq("GRU_CODIGO", groupFilter);
      }
    }

    // Apply empresa filter if selected
    if (empresaFilter && empresaFilter !== "all") {
      query = query.eq("empresa", empresaFilter);
    }

    // Apply ordering
    query = query.order("DESCRICAO");

    const { data, error } = await query;

    if (error) throw error;

    if (!data || data.length === 0) {
      return 0;
    }

    // Convert data to Excel format
    const excelData = data.map(item => ({
      'Código': item.ITEM_CODIGO || '',
      'Descrição': item.DESCRICAO || '',
      'Código Auxiliar': item.CODIGOAUX || '',
      'Grupo': item.GRU_DESCRICAO || '',
      'Código do Grupo': item.GRU_CODIGO || '',
      'Empresa': item.empresa || '',
      'Estação': item.estacao || '',
      'Gênero': item.genero || '',
      'Faixa Etária': item.faixa_etaria || '',
      'NCM': item.ncm || '',
      'Data de Cadastro': item.DATACADASTRO ? new Date(item.DATACADASTRO).toLocaleDateString() : '',
      'Ativo': item.ativo ? 'Sim' : 'Não'
    }));

    // Create a worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 15 }, // Código
      { wch: 40 }, // Descrição
      { wch: 20 }, // Código Auxiliar
      { wch: 25 }, // Grupo
      { wch: 15 }, // Código do Grupo
      { wch: 15 }, // Empresa
      { wch: 15 }, // Estação
      { wch: 15 }, // Gênero
      { wch: 15 }, // Faixa Etária
      { wch: 15 }, // NCM
      { wch: 15 }, // Data de Cadastro
      { wch: 10 }  // Ativo
    ];
    worksheet['!cols'] = columnWidths;

    // Create a workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Itens');

    // Convert to binary
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Create a Blob and save the file
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    // Generate filename with current date
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    
    saveAs(blob, `itens_${formattedDate}.xlsx`);

    return data.length;
  } catch (error) {
    console.error("Error exporting items to Excel:", error);
    throw error;
  }
};

/**
 * Import items from Excel and update in the database
 * @param file The Excel file to import
 * @returns Object with the total items processed and any errors
 */
export const importItemsFromExcel = async (file: File): Promise<{
  success: boolean;
  totalProcessed: number;
  updated: number;
  errors: string[];
}> => {
  try {
    console.log("Iniciando importação de itens do Excel...");
    
    const data = await readExcelFile(file);
    if (!data || data.length === 0) {
      return { success: false, totalProcessed: 0, updated: 0, errors: ["Arquivo vazio ou inválido"] };
    }
    
    console.log(`Processando ${data.length} itens do arquivo Excel`);
    
    const result = {
      success: true,
      totalProcessed: data.length,
      updated: 0,
      errors: [] as string[]
    };
    
    // Process items in batches to avoid timeouts
    const batchSize = 50;
    const batches = Math.ceil(data.length / batchSize);
    
    for (let i = 0; i < batches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, data.length);
      const batch = data.slice(start, end);
      
      console.log(`Processando lote ${i + 1}/${batches} (${batch.length} itens)`);
      
      // Process each item in the batch
      for (const item of batch) {
        try {
          // Skip items without a code
          if (!item.Código && !item['Código']) {
            result.errors.push(`Item sem código foi ignorado`);
            continue;
          }
          
          // Get the item code from the appropriate field
          const itemCode = item.Código || item['Código'];
          
          // Check if item exists
          const { data: existingItems, error: checkError } = await supabase
            .from("BLUEBAY_ITEM")
            .select("ITEM_CODIGO")
            .eq("ITEM_CODIGO", itemCode)
            .limit(1);
            
          if (checkError) {
            result.errors.push(`Erro ao verificar item ${itemCode}: ${checkError.message}`);
            continue;
          }
          
          const exists = existingItems && existingItems.length > 0;
          
          if (!exists) {
            result.errors.push(`Item ${itemCode} não encontrado no banco de dados`);
            continue;
          }
          
          // Map Excel columns to database fields
          const updateData: any = {
            DESCRICAO: item.Descrição || item['Descrição'] || undefined,
            CODIGOAUX: item['Código Auxiliar'] || item.CODIGOAUX || undefined,
            GRU_CODIGO: item['Código do Grupo'] || item.GRU_CODIGO || undefined,
            GRU_DESCRICAO: item['Descrição do Grupo'] || item.GRU_DESCRICAO || undefined,
            empresa: item.Empresa || item.empresa || undefined,
            estacao: item.Estação || item.estacao || undefined,
            genero: item.Gênero || item.genero || undefined,
            faixa_etaria: item['Faixa Etária'] || item.faixa_etaria || undefined,
            ncm: item.NCM || item.ncm || undefined,
          };
          
          // Handle boolean fields
          if (item.Ativo !== undefined || item.ativo !== undefined) {
            const ativoValue = item.Ativo || item.ativo;
            if (typeof ativoValue === 'boolean') {
              updateData.ativo = ativoValue;
            } else if (typeof ativoValue === 'string') {
              updateData.ativo = ativoValue.toLowerCase() === 'sim' || 
                                 ativoValue.toLowerCase() === 'true' || 
                                 ativoValue === '1';
            }
          }
          
          // Remove undefined fields
          Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
              delete updateData[key];
            }
          });
          
          // Update the item in the database
          const { error: updateError } = await supabase
            .from("BLUEBAY_ITEM")
            .update(updateData)
            .eq("ITEM_CODIGO", itemCode);
            
          if (updateError) {
            result.errors.push(`Erro ao atualizar item ${itemCode}: ${updateError.message}`);
          } else {
            result.updated++;
          }
        } catch (itemError: any) {
          result.errors.push(`Erro inesperado ao processar item: ${itemError.message}`);
        }
      }
    }
    
    console.log(`Importação concluída: ${result.updated} itens atualizados, ${result.errors.length} erros`);
    return result;
  } catch (error: any) {
    console.error("Erro na importação de itens:", error);
    return {
      success: false,
      totalProcessed: 0,
      updated: 0,
      errors: [error.message || "Erro desconhecido durante a importação"]
    };
  }
};

/**
 * Read an Excel file and convert to array of objects
 */
const readExcelFile = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error("Falha ao ler o arquivo"));
          return;
        }
        
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON with header row as keys
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsBinaryString(file);
  });
};
