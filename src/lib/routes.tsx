
import Index from "@/pages/Index";
import ClientArea from "@/pages/ClientArea";
import WhatsAppService from "@/pages/WhatsAppService";
import TokenManagement from "@/pages/TokenManagement";
import WhatsAppClientRegistration from "@/pages/WhatsAppClientRegistration";
import MailingRegistration from "@/pages/MailingRegistration";
import ContentManagement from "@/pages/ContentManagement";
import PostManagement from "@/pages/PostManagement";
import JabOrders from "@/pages/JabOrders";
import JabOrdersByClient from "@/pages/JabOrdersByClient";
import AprovacaoFinanceira from "@/pages/AprovacaoFinanceira";

export const routes = [
  { path: "/", element: <Index /> },
  { path: "/client-area", element: <ClientArea /> },
  { path: "/client-area/whatsapp", element: <WhatsAppService /> },
  { path: "/client-area/tokens", element: <TokenManagement /> },
  { path: "/client-area/whatsapp-registration", element: <WhatsAppClientRegistration /> },
  { path: "/client-area/mailing-registration", element: <MailingRegistration /> },
  { path: "/client-area/content-management", element: <ContentManagement /> },
  { path: "/client-area/post-management", element: <PostManagement /> },
  { path: "/client-area/bluebay/jab-orders", element: <JabOrders /> },
  { path: "/client-area/bluebay/jab-orders-by-client", element: <JabOrdersByClient /> },
  { path: "/client-area/bluebay/aprovacao-financeira", element: <AprovacaoFinanceira /> }
];

