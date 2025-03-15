
import { ClienteFinanceiro } from '@/types/financialClient';

export interface ApprovedOrder {
  separacaoId: string;
  clienteData: ClienteFinanceiro;
  approvedAt: Date;
  userId?: string | null;
  userEmail?: string | null;
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
  [pedidoNumber: string]: number;
}

export interface MonthSelection {
  year: number;
  month: number;
}
