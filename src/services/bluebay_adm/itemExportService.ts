
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

type ExcelRow = {
  [key: string]: string | number | boolean | null;
};

/**
 * Exports items to Excel based on current filters
 * @param searchTerm Search term to filter items
 * @param groupFilter Group filter
 * @param empresaFilter Empresa filter
 * @returns Promise with the number of exported items
 */
export const exportItemsToExcel = async (
  searchTerm: string,
  groupFilter: string[],
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

    // Apply group filter if selected (multiple groups)
    if (groupFilter && groupFilter.length > 0) {
      query = query.in("GRU_CODIGO", groupFilter);
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
    const excelData: ExcelRow[] = data.map(item => ({
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
 * Import items from Excel to update the database
 * @param file Excel file
 * @returns Promise with import results
 */
export const importItemsFromExcel = async (file: File): Promise<{
  success: boolean;
  totalProcessed: number;
  updated: number;
  errors: string[];
}> => {
  const result = {
    success: false,
    totalProcessed: 0,
    updated: 0,
    errors: [] as string[]
  };
  
  try {
    // Read the Excel file
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    
    // Assuming the data is in the first sheet
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, any>[];
    
    if (!jsonData || jsonData.length === 0) {
      result.errors.push("O arquivo não contém dados válidos");
      return result;
    }
    
    result.totalProcessed = jsonData.length;
    
    // Process each row
    for (const row of jsonData) {
      try {
        // Skip rows without essential data
        if (!row['Código']) {
          result.errors.push(`Linha sem código identificador`);
          continue;
        }
        
        const itemCode = row['Código'].toString();
        
        // Check if item exists
        const { data: existingItem, error: checkError } = await supabase
          .from("BLUEBAY_ITEM")
          .select("ITEM_CODIGO")
          .eq("ITEM_CODIGO", itemCode)
          .single();
        
        if (checkError || !existingItem) {
          result.errors.push(`Item não encontrado: ${itemCode}`);
          continue;
        }
        
        // Prepare update data
        const updateData: Record<string, any> = {};
        
        // Map Excel columns to database fields
        if (row['Descrição'] !== undefined) updateData.DESCRICAO = row['Descrição'];
        if (row['Código Auxiliar'] !== undefined) updateData.CODIGOAUX = row['Código Auxiliar'];
        if (row['Grupo'] !== undefined) updateData.GRU_DESCRICAO = row['Grupo'];
        if (row['Código do Grupo'] !== undefined) updateData.GRU_CODIGO = row['Código do Grupo'];
        if (row['Empresa'] !== undefined) updateData.empresa = row['Empresa'];
        if (row['Estação'] !== undefined) updateData.estacao = row['Estação'];
        if (row['Gênero'] !== undefined) updateData.genero = row['Gênero'];
        if (row['Faixa Etária'] !== undefined) updateData.faixa_etaria = row['Faixa Etária'];
        if (row['NCM'] !== undefined) updateData.ncm = row['NCM'];
        if (row['Ativo'] !== undefined) {
          const activeValue = typeof row['Ativo'] === 'string' 
            ? row['Ativo'].toLowerCase() === 'sim' 
            : Boolean(row['Ativo']);
          updateData.ativo = activeValue;
        }
        
        // Update the item
        const { error: updateError } = await supabase
          .from("BLUEBAY_ITEM")
          .update(updateData)
          .eq("ITEM_CODIGO", itemCode);
        
        if (updateError) {
          result.errors.push(`Erro ao atualizar ${itemCode}: ${updateError.message}`);
          continue;
        }
        
        result.updated++;
      } catch (rowError: any) {
        result.errors.push(`Erro ao processar linha: ${rowError.message}`);
      }
    }
    
    result.success = true;
    return result;
  } catch (error: any) {
    console.error("Error importing items from Excel:", error);
    result.errors.push(`Erro ao processar arquivo: ${error.message}`);
    return result;
  }
};
