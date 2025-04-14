
import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], fileName: string = 'exported_data') => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return 0;
  }

  try {
    // Create worksheet from JSON data
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Create workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    
    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    
    return data.length; // Return the number of exported items
  } catch (error) {
    console.error('Error exporting data to Excel:', error);
    return 0;
  }
};

export const exportToPdf = (options: {
  filename: string;
  content: HTMLElement | null;
  orientation?: 'portrait' | 'landscape';
}) => {
  if (!options.content) {
    console.error('No content provided for PDF export');
    return;
  }

  try {
    window.print();
  } catch (error) {
    console.error('Error exporting to PDF:', error);
  }
};
