
/**
 * Utility functions for client data transformation
 */

import { BkClient } from "@/types/bk/client";

/**
 * Transforms client data for API operations
 * @param formData Client form data
 * @returns Transformed data ready for API operations
 */
export function transformClientForSave(formData: Partial<BkClient>): any {
  // Extract properties that need special handling
  const { empresas, ...baseData } = formData;
  
  // Create transformed object
  const transformedData = {
    ...baseData,
    CATEGORIA: formData.empresas?.join(','),
    // Make sure fator_correcao is explicitly included in the update
    // Convert to integer if it exists
    fator_correcao: formData.fator_correcao !== undefined && formData.fator_correcao !== null
      ? Math.round(Number(formData.fator_correcao))
      : null
  };
  
  return transformedData;
}

/**
 * Transforms API client data for use in the application
 * @param apiData Client data from API
 * @returns Transformed client with derived fields
 */
export function transformClientFromApi(apiData: any): BkClient {
  return {
    ...apiData,
    empresas: apiData.CATEGORIA?.split(',') || [],
    fator_correcao: apiData.fator_correcao !== null ? Number(apiData.fator_correcao) : 0
  };
}

/**
 * Prepare client data specifically for insert operations
 * @param formData Client form data
 * @returns Data formatted for insert operation
 */
export function prepareClientForInsert(formData: Partial<BkClient>): any {
  const transformedData = transformClientForSave(formData);
  
  // Ensure PES_CODIGO is a number for insert operations
  const pesCodigoAsNumber = Number(transformedData.PES_CODIGO);
  
  return {
    ...transformedData,
    PES_CODIGO: pesCodigoAsNumber
  };
}
