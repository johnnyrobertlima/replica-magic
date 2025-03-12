
// Get client code from item, ensuring it's a number
export const getClientCodeFromItem = (item: any): number | null => {
  if (!item.PES_CODIGO) return null;
  
  const pesCodigoNumerico = typeof item.PES_CODIGO === 'string' 
    ? parseInt(item.PES_CODIGO, 10) 
    : item.PES_CODIGO;
    
  return isNaN(pesCodigoNumerico) ? null : pesCodigoNumerico;
};

// Convert client code to string for database queries
export const clientCodeToString = (clientCode: string | number): string => {
  return String(clientCode);
};
