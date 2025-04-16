import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Export items to Excel file based on filters
 * @param searchTerm Search term to filter items
 * @param groupFilter Group filter
 * @param empresaFilter Company filter
 * @returns Number of exported items
 */
export const exportItemsToExcel = async (
  searchTerm: string,
  groupFilter: string,
  empresaFilter: string
): Promise<number> => {
  try {
    // First, get Bluebay group codes to filter by
    const bluebayGroupCodes = await getBluebayGroupCodes();
    
    // Fetch all items with filters
    const items = await fetchFilteredItemsForExport(searchTerm, groupFilter, empresaFilter, bluebayGroupCodes);
    
    if (!items || items.length === 0) {
      console.log("No items to export");
      return 0;
    }
    
    console.log(`Exporting ${items.length} items to Excel`);
    
    // Convert to worksheet rows
    const worksheetData = items.map(item => ({
      'Código': item.ITEM_CODIGO || '',
      'Descrição': item.DESCRICAO || '',
      'Grupo': item.GRU_DESCRICAO || '',
      'Código Auxiliar': item.CODIGOAUX || '',
      'Empresa': item.empresa || '',
      'Estação': item.estacao || '',
      'Gênero': item.genero || '',
      'Faixa Etária': item.faixa_etaria || '',
      'NCM': item.ncm || ''
    }));
    
    // Create workbook with a single worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(worksheetData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Itens");
    
    // Generate filename with current date
    const now = new Date();
    const fileName = `itens_bluebay_${now.toISOString().split('T')[0]}.xlsx`;
    
    // Write to file and save
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);
    
    return items.length;
  } catch (error) {
    console.error("Error exporting items to Excel:", error);
    throw new Error("Ocorreu um erro ao exportar os itens para Excel");
  }
};

/**
 * Get Bluebay group codes from the database
 */
const getBluebayGroupCodes = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from("bluebay_grupo_item_view")
      .select("gru_codigo")
      .eq("ativo", true)
      .eq("empresa_nome", "Bluebay");

    if (error) {
      console.error("Error fetching Bluebay group codes:", error);
      return [];
    }

    return data.map(group => group.gru_codigo).filter(Boolean);
  } catch (error) {
    console.error("Error in getBluebayGroupCodes:", error);
    return [];
  }
};

/**
 * Fetch filtered items for export
 */
const fetchFilteredItemsForExport = async (
  searchTerm: string,
  groupFilter: string,
  empresaFilter: string,
  bluebayGroupCodes: string[]
): Promise<any[]> => {
  try {
    // Build our query
    let query = supabase
      .from("BLUEBAY_ITEM")
      .select("*")
      .eq("ativo", true) // Only fetch active items
      .in("GRU_CODIGO", bluebayGroupCodes);
    
    // Apply filters
    if (searchTerm) {
      query = query.or(`ITEM_CODIGO.ilike.%${searchTerm}%,DESCRICAO.ilike.%${searchTerm}%,CODIGOAUX.ilike.%${searchTerm}%`);
    }

    if (groupFilter && groupFilter !== "all") {
      query = query.eq("GRU_CODIGO", groupFilter);
    }

    if (empresaFilter && empresaFilter !== "all") {
      query = query.eq("empresa", empresaFilter);
    }

    // Get all matching items
    const { data, error } = await query.order("DESCRICAO");

    if (error) {
      console.error("Error fetching items for export:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching filtered items for export:", error);
    throw error;
  }
};

interface ImportResult {
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
    const reader = new FileReader();
    
    // Use a promise to handle the asynchronous file reading
    const workbook = await new Promise<XLSX.WorkBook>((resolve, reject) => {
      reader.onload = (e: any) => {
        try {
          const binarystr = e.target.result;
          const wb = XLSX.read(binarystr, { type: 'binary' });
          resolve(wb);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsBinaryString(file);
    });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const items: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

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
