
import * as XLSX from 'xlsx';

interface ExportData {
  data: any[];
  filename: string;
  sheetname?: string;
}

export const exportToExcel = ({ data, filename, sheetname = 'Sheet1' }: ExportData) => {
  try {
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetname);
    
    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    alert("Erro ao exportar para Excel. Verifique o console para mais detalhes.");
  }
};
