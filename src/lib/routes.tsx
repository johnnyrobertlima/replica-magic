
import Index from "@/pages/Index";
import ClientArea from "@/pages/ClientArea";
import PostManagement from "@/pages/PostManagement";
import JabOrders from "@/pages/JabOrders";
import JabOrdersByClient from "@/pages/JabOrdersByClient";
import JabOrdersByRepresentante from "@/pages/JabOrdersByRepresentante";
import ContentManagement from "@/pages/ContentManagement";
import MailingRegistration from "@/pages/MailingRegistration";
import TokenManagement from "@/pages/TokenManagement";
import WhatsAppClientRegistration from "@/pages/WhatsAppClientRegistration";
import WhatsAppService from "@/pages/WhatsAppService";
import ClientLogin from "@/pages/ClientLogin";
import AprovacaoFinanceira from "@/pages/AprovacaoFinanceira";
import AcompanhamentoFaturamento from "@/pages/AcompanhamentoFaturamento";
import UserGroupManagement from "@/pages/admin/users/UserGroupManagement";
import { AdminBanners } from "@/pages/admin/banners";
import BluebayHome from "@/pages/BluebayHome";
import BkHome from "@/pages/BkHome";
import { BkClients, BkFinancial, BkReports, BkDashboard, BkFaturamento } from "@/pages/bk";

export const routes = [
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/client-area",
    element: <ClientArea />,
  },
  {
    path: "/client-area/bluebay",
    element: <BluebayHome />,
  },
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
    path: "/client-area/bk/faturamento",
    element: <BkFaturamento />,
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
    path: "/post-management",
    element: <PostManagement />,
  },
  {
    path: "/client-area/bluebay/jab-orders",
    element: <JabOrders />,
  },
  {
    path: "/client-area/bluebay/jab-orders-by-client",
    element: <JabOrdersByClient />,
  },
  {
    path: "/client-area/bluebay/jab-orders-by-representante",
    element: <JabOrdersByRepresentante />,
  },
  {
    path: "/client-area/bluebay/aprovacao-financeira",
    element: <AprovacaoFinanceira />,
  },
  {
    path: "/client-area/bluebay/acompanhamento-faturamento",
    element: <AcompanhamentoFaturamento />,
  },
  {
    path: "/client-area/content-management",
    element: <ContentManagement />,
  },
  {
    path: "/client-area/mailing-registration",
    element: <MailingRegistration />,
  },
  {
    path: "/client-area/tokens",
    element: <TokenManagement />,
  },
  {
    path: "/client-area/whatsapp-registration",
    element: <WhatsAppClientRegistration />,
  },
  {
    path: "/client-area/whatsapp",
    element: <WhatsAppService />,
  },
  {
    path: "/login",
    element: <ClientLogin />,
  },
  {
    path: "/admin/users",
    element: <UserGroupManagement />,
  },
  {
    path: "/admin/banners",
    element: <AdminBanners />,
  },
] as const;
