
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Convert items to worksheet data for export
 */
export const convertItemsToWorksheet = (items: any[]): Record<string, string>[] => {
  return items.map(item => ({
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
};

/**
 * Create and download an Excel file from data
 */
export const createAndDownloadExcel = (data: Record<string, string>[], fileName: string): void => {
  // Create workbook with a single worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Itens");
  
  // Write to file and save
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);
};

/**
 * Process Excel file and extract data using a Promise-based approach
 */
export const readExcelFile = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e: any) => {
      try {
        const binarystr = e.target.result;
        const wb = XLSX.read(binarystr, { type: 'binary' });
        
        const sheetName = wb.SheetNames[0];
        const worksheet = wb.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsBinaryString(file);
  });
};
