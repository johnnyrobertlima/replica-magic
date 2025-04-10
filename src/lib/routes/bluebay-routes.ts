
import BluebayHome from "@/pages/BluebayHome";
import JabOrders from "@/pages/JabOrders";
import JabOrdersByClient from "@/pages/JabOrdersByClient";
import JabOrdersByRepresentante from "@/pages/JabOrdersByRepresentante";
import AprovacaoFinanceira from "@/pages/AprovacaoFinanceira";
import AcompanhamentoFaturamento from "@/pages/AcompanhamentoFaturamento";

export const bluebayRoutes = [
  {
    path: "/client-area/bluebay",
    element: BluebayHome,
  },
  {
    path: "/client-area/bluebay/jab-orders",
    element: JabOrders,
  },
  {
    path: "/client-area/bluebay/jab-orders-by-client",
    element: JabOrdersByClient,
  },
  {
    path: "/client-area/bluebay/jab-orders-by-representante",
    element: JabOrdersByRepresentante,
  },
  {
    path: "/client-area/bluebay/aprovacao-financeira",
    element: AprovacaoFinanceira,
  },
  {
    path: "/client-area/bluebay/acompanhamento-faturamento",
    element: AcompanhamentoFaturamento,
  },
] as const;
