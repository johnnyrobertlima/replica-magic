import Index from "@/pages/Index";
import ClientArea from "@/pages/ClientArea";
import PostManagement from "@/pages/PostManagement";
import JabOrders from "@/pages/JabOrders";
import JabOrdersByClient from "@/pages/JabOrdersByClient";
import ContentManagement from "@/pages/ContentManagement";
import MailingRegistration from "@/pages/MailingRegistration";
import TokenManagement from "@/pages/TokenManagement";
import WhatsAppClientRegistration from "@/pages/WhatsAppClientRegistration";
import WhatsAppService from "@/pages/WhatsAppService";
import ClientLogin from "@/pages/ClientLogin";
import AprovacaoFinanceira from "@/pages/AprovacaoFinanceira";
import UserGroupManagement from "@/pages/UserGroupManagement";

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
    path: "/client-area/bluebay/aprovacao-financeira",
    element: <AprovacaoFinanceira />,
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
] as const;
