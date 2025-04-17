
import { supabase } from "@/integrations/supabase/client";
import { readExcelFile } from "./utils/excelUtils";

// Define a type for the import result
export interface ImportResult {
  success: boolean;
  totalProcessed: number;
  updated: number;
  errors: string[];
}

/**
 * Import items from Excel file
 * @param file Excel file to import
 * @returns ImportResult
 */
export const importItemsFromExcel = async (file: File): Promise<ImportResult> => {
  try {
    // Read the Excel file
    const items = await readExcelFile(file);
    
    const importResult: ImportResult = {
      success: true,
      totalProcessed: 0,
      updated: 0,
      errors: []
    };

    // Process each item in the Excel file
    for (let i = 1; i < items.length; i++) {
      importResult.totalProcessed++;
      const row = items[i];

      // Skip empty rows
      if (!row || row.length === 0) {
        continue;
      }

      // Map columns to item properties
      const itemCode = row[0]?.toString(); // Ensure itemCode is a string
      const description = row[1]?.toString();
      const groupCode = row[2]?.toString();
      const auxCode = row[3]?.toString();
      const company = row[4]?.toString();
      const estacao = row[5]?.toString();
      const genero = row[6]?.toString();
      const faixaEtaria = row[7]?.toString();
      const ncm = row[8]?.toString();

      // Validate required fields
      if (!itemCode || !description || !groupCode) {
        importResult.errors.push(`Linha ${i + 1}: Código do item, descrição e código do grupo são obrigatórios.`);
        continue;
      }

      try {
        // Check if the item exists
        const { data: existingItem, error: selectError } = await supabase
          .from('BLUEBAY_ITEM')
          .select('ITEM_CODIGO')
          .eq('ITEM_CODIGO', itemCode)
          .single();

        if (selectError) {
          throw selectError;
        }

        // Prepare item data for update or insert
        const itemData = {
          ITEM_CODIGO: itemCode,
          DESCRICAO: description,
          GRU_CODIGO: groupCode,
          CODIGOAUX: auxCode,
          empresa: company,
          estacao: estacao,
          genero: genero,
          faixa_etaria: faixaEtaria,
          ncm: ncm
        };

        // Update or insert the item
        if (existingItem) {
          const { error: updateError } = await supabase
            .from('BLUEBAY_ITEM')
            .update(itemData)
            .eq('ITEM_CODIGO', itemCode);

          if (updateError) {
            throw updateError;
          }

          importResult.updated++;
        } else {
          importResult.errors.push(`Linha ${i + 1}: Item com código ${itemCode} não encontrado para atualização.`);
          continue;
        }
      } catch (error: any) {
        console.error(`Erro ao processar linha ${i + 1}:`, error);
        importResult.errors.push(`Linha ${i + 1}: ${error.message || 'Erro desconhecido'}`);
      }
    }

    importResult.success = importResult.errors.length === 0;
    return importResult;
  } catch (error: any) {
    console.error("Erro ao importar itens do Excel:", error);
    return {
      success: false,
      totalProcessed: 0,
      updated: 0,
      errors: [error.message || "Ocorreu um erro ao importar os itens do Excel"]
    };
  }
};
