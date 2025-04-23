
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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

export interface ExportToPdfOptions {
  filename: string;
  content: HTMLElement | null;
  orientation?: 'portrait' | 'landscape';
  data?: any[];
}

export const exportToPdf = (options: ExportToPdfOptions) => {
  if (!options.content && !options.data) {
    console.error('No content or data provided for PDF export');
    return;
  }

  try {
    if (options.data) {
      // Create a temporary HTML document with the formatted data
      const tempDiv = document.createElement('div');
      tempDiv.style.display = 'none';
      tempDiv.style.width = '100%';
      document.body.appendChild(tempDiv);
      
      // Add basic styles with smaller font (now size 10)
      tempDiv.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 20px; font-size: 10px;">
          <h1 style="text-align: center; color: #333; margin-bottom: 20px; font-size: 12px;">Agenda de Conteúdo</h1>
          <div id="pdf-content"></div>
        </div>
      `;
      
      const contentDiv = tempDiv.querySelector('#pdf-content');
      if (contentDiv && Array.isArray(options.data)) {
        // Group events by date
        const groupedEvents = options.data.reduce((acc: Record<string, any[]>, event: any) => {
          const dateKey = event.scheduled_date;
          if (!acc[dateKey]) {
            acc[dateKey] = [];
          }
          acc[dateKey].push(event);
          return acc;
        }, {});
        
        // Sort dates
        const sortedDates = Object.keys(groupedEvents).sort();
        
        // Create content for each date
        sortedDates.forEach(dateString => {
          const date = new Date(dateString);
          const formattedDate = format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
          
          const dateSection = document.createElement('div');
          dateSection.style.marginBottom = '20px';
          dateSection.innerHTML = `
            <h2 style="color: #4f46e5; font-size: 11px; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">
              ${formattedDate}
            </h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 10px;">
              <thead>
                <tr style="background-color: #f3f4f6;">
                  <th style="text-align: left; padding: 8px; border-bottom: 1px solid #e5e7eb;">Serviço</th>
                  <th style="text-align: left; padding: 8px; border-bottom: 1px solid #e5e7eb;">Linha Editorial</th>
                  <th style="text-align: left; padding: 8px; border-bottom: 1px solid #e5e7eb;">Nome</th>
                  <th style="text-align: left; padding: 8px; border-bottom: 1px solid #e5e7eb;">Descrição</th>
                  <th style="text-align: left; padding: 8px; border-bottom: 1px solid #e5e7eb;">Colaborador</th>
                  <th style="text-align: left; padding: 8px; border-bottom: 1px solid #e5e7eb;">Status</th>
                </tr>
              </thead>
              <tbody id="events-${dateString}"></tbody>
            </table>
          `;
          
          contentDiv.appendChild(dateSection);
          
          const tbody = dateSection.querySelector(`#events-${dateString}`);
          if (tbody) {
            groupedEvents[dateString].forEach(event => {
              const row = document.createElement('tr');
              row.style.borderBottom = '1px solid #e5e7eb';
              
              // Handle potentially missing properties safely
              const serviceColor = event.service?.color || '#ccc';
              const serviceName = event.service?.name || 'Não definido';
              
              row.innerHTML = `
                <td style="padding: 8px;">
                  <div style="display: flex; align-items: center;">
                    <div style="height: 10px; width: 10px; border-radius: 50%; background-color: ${serviceColor}; margin-right: 5px;"></div>
                    ${serviceName}
                  </div>
                </td>
                <td style="padding: 8px;">
                  ${event.editorial_line ? 
                    `<div style="display: flex; align-items: center;">
                      <div style="height: 10px; width: 10px; border-radius: 50%; background-color: ${event.editorial_line.color || '#ccc'}; margin-right: 5px;"></div>
                      ${event.editorial_line.name}
                    </div>` : 
                    "—"}
                </td>
                <td style="padding: 8px; font-weight: 500;">
                  ${event.title || "—"}
                  ${event.product ? `<span style="color: #6b7280; margin-left: 4px;">- ${event.product.name}</span>` : ''}
                </td>
                <td style="padding: 8px; max-width: 200px; white-space: pre-line;">
                  ${event.description || "—"}
                </td>
                <td style="padding: 8px;">
                  ${event.collaborator ? `${event.collaborator.name}` : "—"}
                </td>
                <td style="padding: 8px;">
                  <span style="background-color: ${event.status ? event.status.color || '#9CA3AF' : '#9CA3AF'}; 
                        color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">
                    ${event.status ? event.status.name : "Pendente"}
                  </span>
                </td>
              `;
              
              tbody.appendChild(row);
            });
          }
        });
      }
      
      // Use window.print() to print only this temporary div
      const originalBodyDisplay = document.body.style.display;
      const allElements = document.body.children;
      
      // Hide all other elements
      for (let i = 0; i < allElements.length; i++) {
        if (allElements[i] !== tempDiv) {
          (allElements[i] as HTMLElement).style.display = 'none';
        }
      }
      
      // Only show our temporary content
      tempDiv.style.display = 'block';
      
      // Print
      window.print();
      
      // Restore visibility of original elements
      for (let i = 0; i < allElements.length; i++) {
        if (allElements[i] !== tempDiv) {
          (allElements[i] as HTMLElement).style.display = '';
        }
      }
      
      // Remove the temporary element
      document.body.removeChild(tempDiv);
      
    } else if (options.content) {
      // Default behavior: print the provided element
      window.print();
    }
  } catch (error) {
    console.error('Error exporting to PDF:', error);
  }
};
