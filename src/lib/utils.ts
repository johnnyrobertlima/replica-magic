
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | undefined | null): string {
  // Return empty string or 0 if value is undefined or null
  if (value === undefined || value === null) {
    return "R$ 0,00";
  }
  
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}
