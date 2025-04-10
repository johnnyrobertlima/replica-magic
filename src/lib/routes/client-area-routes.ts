
import ClientArea from "@/pages/ClientArea";
import PostManagement from "@/pages/PostManagement";
import ContentManagement from "@/pages/ContentManagement";
import MailingRegistration from "@/pages/MailingRegistration";
import TokenManagement from "@/pages/TokenManagement";
import WhatsAppClientRegistration from "@/pages/WhatsAppClientRegistration";
import WhatsAppService from "@/pages/WhatsAppService";
import Representantes from "@/pages/Representantes";

export const clientAreaRoutes = [
  {
    path: "/client-area",
    element: <ClientArea />,
  },
  {
    path: "/post-management",
    element: <PostManagement />,
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
    path: "/client-area/representantes",
    element: <Representantes />,
  },
] as const;
