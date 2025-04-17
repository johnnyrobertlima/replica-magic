
import { getBluebayGroupCodes, fetchFilteredItems } from "./utils/itemDataUtils";
import { convertItemsToWorksheet, createAndDownloadExcel } from "./utils/excelUtils";

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
    const worksheetData = convertItemsToWorksheet(items);
    
    // Generate filename with current date
    const now = new Date();
    const fileName = `itens_bluebay_${now.toISOString().split('T')[0]}.xlsx`;
    
    // Create and download the Excel file
    createAndDownloadExcel(worksheetData, fileName);
    
    return items.length;
  } catch (error) {
    console.error("Error exporting items to Excel:", error);
    throw new Error("Ocorreu um erro ao exportar os itens para Excel");
  }
};
