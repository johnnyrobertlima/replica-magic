
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
