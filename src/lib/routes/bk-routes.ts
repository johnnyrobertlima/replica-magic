
import BkHome from "@/pages/BkHome";
import { 
  BkClients, 
  BkFinancial, 
  BkReports, 
  BkDashboard, 
  BkGestaoTitulos, 
  BkFinanceiroManager, 
  BkClientFinancialSummary, 
  BkEstoque, 
  BkRequests, 
  BkInvoiceControl, 
  BkPedidos 
} from "@/pages/bk";

export const bkRoutes = [
  {
    path: "/client-area/bk",
    element: <BkHome />,
  },
  {
    path: "/client-area/bk/clients",
    element: <BkClients />,
  },
  {
    path: "/client-area/bk/financial",
    element: <BkFinancial />,
  },
  {
    path: "/client-area/bk/gestaotitulos",
    element: <BkGestaoTitulos />,
  },
  {
    path: "/client-area/bk/financeiromanager",
    element: <BkFinanceiroManager />,
  },
  {
    path: "/client-area/bk/clientefinancial",
    element: <BkClientFinancialSummary />,
  },
  {
    path: "/client-area/bk/reports",
    element: <BkReports />,
  },
  {
    path: "/client-area/bk/dashboard",
    element: <BkDashboard />,
  },
  {
    path: "/client-area/bk/estoque",
    element: <BkEstoque />,
  },
  {
    path: "/client-area/bk/requests",
    element: <BkRequests />,
  },
  {
    path: "/client-area/bk/invoice-control",
    element: <BkInvoiceControl />,
  },
  {
    path: "/client-area/bk/pedidos",
    element: <BkPedidos />,
  },
] as const;
