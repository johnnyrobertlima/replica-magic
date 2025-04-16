
import { getBluebayGroupCodes, fetchFilteredItems } from "./utils/itemDataUtils";
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
    console.log(`Using ${bluebayGroupCodes.length} Bluebay group codes for filtering export items`);
    
    // Fetch all items with filters
    const items = await fetchFilteredItems(searchTerm, groupFilter, empresaFilter, bluebayGroupCodes);
    
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
