
import BluebayAdmHome from "@/pages/BluebayAdmHome";
import { 
  BluebayAdmReports, 
  BluebayAdmDashboard, 
  BluebayAdmClients, 
  BluebayAdmFinancial, 
  BluebayAdmEstoque, 
  BluebayAdmPedidos, 
  BluebayAdmFinanceiroManager, 
  BluebayAdmRequests, 
  BluebayAdmAnaliseDeCompra 
} from "@/pages/bluebay_adm";

export const bluebayAdmRoutes = [
  {
    path: "/client-area/bluebay_adm",
    element: BluebayAdmHome,
  },
  {
    path: "/client-area/bluebay_adm/reports",
    element: BluebayAdmReports,
  },
  {
    path: "/client-area/bluebay_adm/dashboard",
    element: BluebayAdmDashboard,
  },
  {
    path: "/client-area/bluebay_adm/clients",
    element: BluebayAdmClients,
  },
  {
    path: "/client-area/bluebay_adm/financial",
    element: BluebayAdmFinancial,
  },
  {
    path: "/client-area/bluebay_adm/estoque",
    element: BluebayAdmEstoque,
  },
  {
    path: "/client-area/bluebay_adm/annalisedecompra",
    element: BluebayAdmAnaliseDeCompra,
  },
  {
    path: "/client-area/bluebay_adm/pedidos",
    element: BluebayAdmPedidos,
  },
  {
    path: "/client-area/bluebay_adm/financeiromanager",
    element: BluebayAdmFinanceiroManager,
  },
  {
    path: "/client-area/bluebay_adm/requests",
    element: BluebayAdmRequests,
  },
] as const;
