
import { ClienteFinanceiro } from '@/types/financialClient';
import { Json } from '@/integrations/supabase/types';

export interface ApprovedOrder {
  id?: string;
  separacao_id: string;
  cliente_data: ClienteFinanceiro;
  approved_at: Date | string;
  user_id?: string | null;
  user_email?: string | null;
  action?: string;
  
  // Properties used in the client-side
  separacaoId?: string;
  clienteData?: ClienteFinanceiro;
  approvedAt?: Date;
  userId?: string | null;
  userEmail?: string | null;
}

export interface OrderTotals {
  valorTotal: number;
  quantidadeItens: number;
  quantidadePedidos: number;
  valorFaltaFaturar: number;
  valorFaturado: number;
}

export interface PendingValuesState {
  [pedidoNumber: string]: number;
}

export interface MonthSelection {
  year: number;
  month: number;
}
