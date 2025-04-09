
import * as XLSX from 'xlsx';

/**
 * Utility functions for exporting data to Excel format
 */

/**
 * Export data to Excel file (.xlsx)
 * @param data Array of objects to export
 * @param fileName Filename for the exported file (without extension)
 * @returns The number of exported items
 */
export const exportToExcel = (data: any[], fileName: string) => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return 0;
  }

  try {
    // Sanitize filename to avoid issues
    const safeFileName = sanitizeFileName(fileName);
    
    // Create worksheet from JSON data
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Create workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    
    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `${safeFileName}.xlsx`);
    
    return data.length; // Return the number of exported items
  } catch (error) {
    console.error('Error exporting data to Excel:', error);
    return 0;
  }
};

/**
 * Export data with headers and items (separated by empty rows) to Excel file
 * @param headerData Array of header objects to export
 * @param itemsData Array of item objects to export
 * @param fileName Filename for the exported file (without extension)
 * @returns The total number of exported rows
 */
export const exportToExcelWithSections = (
  headerData: any[], 
  itemsData: any[], 
  fileName: string
) => {
  if ((!headerData || headerData.length === 0) && (!itemsData || itemsData.length === 0)) {
    console.error('No data to export');
    return 0;
  }

  try {
    // Sanitize filename to avoid issues
    const safeFileName = sanitizeFileName(fileName);
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // If we have both header and items data, we combine them with empty rows in between
    if (headerData.length > 0 && itemsData.length > 0) {
      // Log the data structure to help with debugging
      console.log('Exportando dados com cabeçalho e itens', {
        headerCount: headerData.length,
        itemsCount: itemsData.length
      });
      
      // First convert all data to worksheets
      const headerWorksheet = XLSX.utils.json_to_sheet(headerData);
      const itemsWorksheet = XLSX.utils.json_to_sheet(itemsData);
      
      // Get A1-style ranges for both
      const headerRange = XLSX.utils.decode_range(headerWorksheet['!ref'] || 'A1');
      const itemsRange = XLSX.utils.decode_range(itemsWorksheet['!ref'] || 'A1');
      
      // Create a new worksheet for combined data
      const combinedWorksheet = XLSX.utils.json_to_sheet(headerData);
      
      // Calculate where to place the items data (after header data + 2 empty rows)
      const startRow = headerRange.e.r + 3; // +3 because we start at 0 and want 2 empty rows
      
      // Add items data to the combined worksheet with offset
      for (let R = 0; R <= itemsRange.e.r; ++R) {
        for (let C = 0; C <= itemsRange.e.c; ++C) {
          const itemsCellRef = XLSX.utils.encode_cell({r: R, c: C});
          const targetCellRef = XLSX.utils.encode_cell({r: R + startRow, c: C});
          
          if (itemsWorksheet[itemsCellRef]) {
            combinedWorksheet[targetCellRef] = itemsWorksheet[itemsCellRef];
          }
        }
      }
      
      // Update range of combined worksheet
      const newRange = {
        s: {r: 0, c: 0},
        e: {r: startRow + itemsRange.e.r, c: Math.max(headerRange.e.c, itemsRange.e.c)}
      };
      combinedWorksheet['!ref'] = XLSX.utils.encode_range(newRange);
      
      // If there are merged cells, adjust their row indices and add them to the combined sheet
      if (itemsWorksheet['!merges']) {
        if (!combinedWorksheet['!merges']) combinedWorksheet['!merges'] = [];
        itemsWorksheet['!merges'].forEach(merge => {
          combinedWorksheet['!merges']?.push({
            s: {r: merge.s.r + startRow, c: merge.s.c},
            e: {r: merge.e.r + startRow, c: merge.e.c}
          });
        });
      }
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, combinedWorksheet, 'Pedido');
    } else if (headerData.length > 0) {
      // Only header data
      const worksheet = XLSX.utils.json_to_sheet(headerData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');
    } else {
      // Only items data
      const worksheet = XLSX.utils.json_to_sheet(itemsData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Itens');
    }
    
    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `${safeFileName}.xlsx`);
    
    return headerData.length + itemsData.length;
  } catch (error) {
    console.error('Error exporting data to Excel with sections:', error);
    throw error; // Re-throw to allow proper error handling by the caller
  }
};

/**
 * Export data with grouped sections to Excel
 * @param groupedData Object with group names as keys and arrays of items as values
 * @param fileName Filename for the exported file
 * @returns The number of exported rows
 */
export const exportGroupedDataToExcel = (
  groupedData: Record<string, any[]>,
  fileName: string
) => {
  try {
    // Sanitize filename to avoid issues
    const safeFileName = sanitizeFileName(fileName);
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([[]]);
    
    let rowIndex = 0;
    
    // For each group
    Object.entries(groupedData).forEach(([groupName, items], groupIndex) => {
      // Add a gap between groups
      if (groupIndex > 0) {
        rowIndex += 1;
      }
      
      // Add group header
      const groupHeader = [groupName];
      XLSX.utils.sheet_add_aoa(worksheet, [groupHeader], { origin: { r: rowIndex, c: 0 } });
      rowIndex += 1;
      
      // If there are items in this group
      if (items && items.length > 0) {
        // Add headers based on the first item's keys
        const headerRow = Object.keys(items[0]);
        XLSX.utils.sheet_add_aoa(worksheet, [headerRow], { origin: { r: rowIndex, c: 0 } });
        rowIndex += 1;
        
        // Add items data
        items.forEach(item => {
          const itemRow = Object.values(item);
          XLSX.utils.sheet_add_aoa(worksheet, [itemRow], { origin: { r: rowIndex, c: 0 } });
          rowIndex += 1;
        });
      }
      
      rowIndex += 1; // Add an extra row after each group
    });
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Grupos');
    
    // Generate Excel file
    XLSX.writeFile(workbook, `${safeFileName}.xlsx`);
    
    return rowIndex; // Return the number of rows created
  } catch (error) {
    console.error('Error exporting grouped data to Excel:', error);
    return 0;
  }
};

/**
 * Sanitize a filename to ensure it's valid for most file systems
 * Removes illegal characters and limits length
 */
const sanitizeFileName = (fileName: string): string => {
  // Remove characters that are illegal in filenames
  let safeName = fileName.replace(/[\/\\?%*:|"<>]/g, '-');
  
  // Limit the length to a reasonable size (adjust if needed)
  safeName = safeName.substring(0, 100);
  
  return safeName;
};
