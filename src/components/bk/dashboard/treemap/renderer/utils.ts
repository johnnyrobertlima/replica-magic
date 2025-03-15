
import * as d3 from "d3";

/**
 * Generate a color scale for treemap cells
 */
export const colorScale = (value: number): string => {
  const interpolator = d3.interpolateRgb('#8ecae6', '#023047');
  return interpolator(Math.log(value + 1) / 15);
};

/**
 * Format currency for display
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Truncate text to fit in a container
 */
export const truncateText = (text: string, width: number): string => {
  if (!text) return '';
  
  const maxChars = Math.floor(width / 6);
  if (text.length <= maxChars) return text;
  
  return text.substring(0, maxChars - 3) + '...';
};
