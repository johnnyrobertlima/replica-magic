
import { ItemReport } from "../types";

/**
 * Generate test data for development and testing purposes
 */
export const generateTestData = (): ItemReport[] => {
  console.log("Using test data for development");
  return [
    {
      ITEM_CODIGO: "TEST001",
      DESCRICAO: "Test Item 1",
      GRU_DESCRICAO: "Test Group",
      TOTAL_QUANTIDADE: 100,
      TOTAL_VALOR: 5000,
      OCORRENCIAS: 5
    },
    {
      ITEM_CODIGO: "TEST002",
      DESCRICAO: "Test Item 2",
      GRU_DESCRICAO: "Test Group",
      TOTAL_QUANTIDADE: 200,
      TOTAL_VALOR: 8000,
      OCORRENCIAS: 8
    },
    {
      ITEM_CODIGO: "TEST003",
      DESCRICAO: "Test Item 3",
      GRU_DESCRICAO: "Another Group",
      TOTAL_QUANTIDADE: 50,
      TOTAL_VALOR: 2500,
      OCORRENCIAS: 3
    }
  ];
};

/**
 * Check if running in development environment
 */
export const isDevelopmentEnvironment = (): boolean => {
  return typeof window !== 'undefined' && window.location.hostname === 'localhost';
};
