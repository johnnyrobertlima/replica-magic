
/**
 * Calculate the total value of selected items
 * @param selectedItemsDetails Record containing details of selected items
 * @returns Total value of selected items
 */
export const calculateTotalSelected = (
  selectedItemsDetails: Record<string, { qtde: number; valor: number }>
): number => {
  return Object.values(selectedItemsDetails).reduce((total, item) => {
    return total + (item.qtde * item.valor);
  }, 0);
};

/**
 * Extract the client code from an item
 * @param item Item object containing client code
 * @returns Numeric client code or null if not found
 */
export const getClientCodeFromItem = (item: any): number | null => {
  let pesCodigoNumerico = null;
  
  if (typeof item.PES_CODIGO === 'number') {
    pesCodigoNumerico = item.PES_CODIGO;
  } else if (typeof item.PES_CODIGO === 'string') {
    const parsed = parseInt(item.PES_CODIGO, 10);
    if (!isNaN(parsed)) {
      pesCodigoNumerico = parsed;
    }
  } else if (item.PES_CODIGO && typeof item.PES_CODIGO === 'object') {
    const value = item.PES_CODIGO.value;
    if (typeof value === 'string' || typeof value === 'number') {
      const parsed = parseInt(String(value), 10);
      if (!isNaN(parsed)) {
        pesCodigoNumerico = parsed;
      }
    }
  }

  return pesCodigoNumerico;
};
