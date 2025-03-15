
import type { Database } from "@/integrations/supabase/types";

// Define the Json type correctly by referencing the Supabase type
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface ApprovedOrder {
  id: string;
  separacao_id: string;
  cliente_data: any;
  approved_at: string;
  user_id?: string;
  user_email?: string;
  action?: string;
}

export interface OrderTotals {
  valorTotal: number;
  quantidadeItens: number;
  quantidadePedidos: number;
  valorFaltaFaturar: number;
  valorFaturado: number;
}

export interface PendingValuesState {
  [clienteId: string]: number;
}

export interface MonthSelection {
  year: number;
  month: number;
}
