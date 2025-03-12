
// Get client code from item, ensuring it's a number
export const getClientCodeFromItem = (item: any): number | null => {
  if (!item.PES_CODIGO) return null;
  
  const pesCodigoNumerico = typeof item.PES_CODIGO === 'string' 
    ? parseInt(item.PES_CODIGO, 10) 
    : item.PES_CODIGO;
    
  return isNaN(pesCodigoNumerico) ? null : pesCodigoNumerico;
};

// Convert any client code (string or number) to string for database queries
export const clientCodeToString = (clientCode: string | number): string => {
  return String(clientCode);
};

// Convert any client code (string or number) to number for internal use
export const clientCodeToNumber = (clientCode: string | number): number => {
  const numericValue = typeof clientCode === 'string' ? parseInt(clientCode, 10) : clientCode;
  return isNaN(numericValue) ? 0 : numericValue;
};

// Convert an array of client codes to an array of strings
export const clientCodesToStrings = (clientCodes: (string | number)[]): string[] => {
  return clientCodes.map(code => clientCodeToString(code));
};

// Convert an array of client codes to an array of numbers
export const clientCodesToNumbers = (clientCodes: (string | number)[]): number[] => {
  return clientCodes.map(code => clientCodeToNumber(code));
};
