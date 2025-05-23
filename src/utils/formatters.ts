
/**
 * Formats a number as currency (BRL)
 * @param value Number to format
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Format number with thousand separators
 * @param value Number to format
 * @returns Formatted number string
 */
export const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '0';
  
  return new Intl.NumberFormat('pt-BR').format(value);
};

/**
 * Determines the CSS class for a card border based on financial values
 * @param valoresVencidos Amount of overdue values
 * @param valoresEmAberto Amount of open values
 * @returns Tailwind CSS class for card border
 */
export const getCardBorderClass = (
  valoresVencidos: number | null | undefined, 
  valoresEmAberto: number | null | undefined
): string => {
  // Default border class
  const defaultBorder = 'border-l-4';
  
  // Handle null/undefined values
  if (valoresVencidos === null || valoresVencidos === undefined) valoresVencidos = 0;
  if (valoresEmAberto === null || valoresEmAberto === undefined) valoresEmAberto = 0;
  
  // Determine the appropriate color class based on the criteria
  if (valoresVencidos > 0) {
    return `${defaultBorder} border-l-red-500`; // Red for overdue values > 0
  } else if (valoresEmAberto > 5000) {
    return `${defaultBorder} border-l-amber-500`; // Yellow for no overdue values and open values > 5000
  } else {
    return `${defaultBorder} border-l-green-500`; // Green for no overdue values and open values < 5000
  }
};
