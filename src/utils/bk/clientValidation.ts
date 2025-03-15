
/**
 * Utility functions for client form validation
 */

import { BkClient } from "@/types/bk/client";

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validates a client form data object
 * @param client The client data to validate
 * @returns Array of validation errors or empty array if valid
 */
export function validateClientForm(client: Partial<BkClient>): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate required fields
  if (!client.PES_CODIGO) {
    errors.push({ field: 'PES_CODIGO', message: 'Código do cliente é obrigatório' });
  }

  // Validate numeric fields
  if (client.PES_CODIGO && isNaN(Number(client.PES_CODIGO))) {
    errors.push({ field: 'PES_CODIGO', message: 'Código do cliente deve ser um número válido' });
  }
  
  if (client.volume_saudavel_faturamento && isNaN(Number(client.volume_saudavel_faturamento))) {
    errors.push({ field: 'volume_saudavel_faturamento', message: 'Volume saudável deve ser um número válido' });
  }

  if (client.fator_correcao && (isNaN(Number(client.fator_correcao)) || !Number.isInteger(Number(client.fator_correcao)) || Number(client.fator_correcao) < 0)) {
    errors.push({ field: 'fator_correcao', message: 'Fator de correção deve ser um número inteiro positivo' });
  }

  return errors;
}

/**
 * Check if a client code already exists in the clients list
 */
export function isClientCodeUnique(code: number, existingClients: BkClient[]): boolean {
  return !existingClients.some(client => client.PES_CODIGO === code);
}
