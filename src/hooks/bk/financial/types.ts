
import { ConsolidatedInvoice, FinancialTitle } from "@/services/bk/types/financialTypes";

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export interface FinancialSummary {
  totalValoresVencidos: number;
  totalPago: number; 
  totalEmAberto: number;
}

export interface ClientFinancialSummary {
  PES_CODIGO: string;
  CLIENTE_NOME: string;
  totalValoresVencidos: number;
  totalPago: number;
  totalEmAberto: number;
}

export interface UseFinancialReturnType {
  isLoading: boolean;
  consolidatedInvoices: ConsolidatedInvoice[];
  filteredInvoices: ConsolidatedInvoice[];
  financialTitles: FinancialTitle[];
  filteredTitles: FinancialTitle[];
  refreshData: () => Promise<void>;
  dateRange: DateRange;
  updateDateRange: (newDateRange: DateRange) => void;
  statusFilter: string;
  updateStatusFilter: (status: string) => void;
  availableStatuses: string[];
  clientFilter: string;
  updateClientFilter: (client: string) => void;
  notaFilter: string;
  updateNotaFilter: (nota: string) => void;
  financialSummary: FinancialSummary;
  clientFinancialSummaries: ClientFinancialSummary[];
  filterClientSummaries: () => ClientFinancialSummary[];
}
