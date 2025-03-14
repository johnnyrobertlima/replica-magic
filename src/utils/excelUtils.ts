
/**
 * Utility functions for exporting data to Excel/CSV format
 */

/**
 * Export data to Excel file
 * @param data Array of objects to export
 * @param fileName Filename for the exported file (without extension)
 */
export const exportToExcel = (data: any[], fileName: string) => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  try {
    // Create CSV content
    const headers = Object.keys(data[0]);
    const csvContent = [
      // Headers row
      headers.join(','),
      // Data rows
      ...data.map(row => 
        headers.map(header => {
          let cell = row[header] === null || row[header] === undefined ? '' : row[header];
          
          // Handle numbers
          if (typeof cell === 'number') {
            return cell;
          }
          
          // Handle strings (escape quotes and wrap in quotes if contains commas)
          if (typeof cell === 'string') {
            // Replace double quotes with two double quotes
            cell = cell.replace(/"/g, '""');
            
            // Wrap in quotes if contains commas, quotes, or newlines
            if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
              cell = `"${cell}"`;
            }
            
            return cell;
          }
          
          return cell;
        }).join(',')
      )
    ].join('\n');

    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a link element and trigger download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    
    return data.length; // Return the number of exported items
  } catch (error) {
    console.error('Error exporting data to Excel:', error);
    return 0;
  }
};
