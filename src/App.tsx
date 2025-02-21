
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import ClientArea from "@/pages/ClientArea";
import WhatsAppService from "@/pages/WhatsAppService";
import TokenManagement from "@/pages/TokenManagement";
import WhatsAppClientRegistration from "@/pages/WhatsAppClientRegistration";
import MailingRegistration from "@/pages/MailingRegistration";
import ContentManagement from "@/pages/ContentManagement";
import PostManagement from "@/pages/PostManagement";
import JabOrdersByClient from "@/pages/JabOrdersByClient";
import AprovacaoFinanceira from "@/pages/AprovacaoFinanceira";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/client-area" element={<ClientArea />} />
        <Route path="/client-area/whatsapp" element={<WhatsAppService />} />
        <Route path="/client-area/tokens" element={<TokenManagement />} />
        <Route path="/client-area/whatsapp-registration" element={<WhatsAppClientRegistration />} />
        <Route path="/client-area/mailing-registration" element={<MailingRegistration />} />
        <Route path="/client-area/content-management" element={<ContentManagement />} />
        <Route path="/client-area/post-management" element={<PostManagement />} />
        <Route path="/client-area/bluebay/jab-orders" element={<JabOrdersByClient />} />
        <Route path="/client-area/bluebay/jab-orders-by-client" element={<JabOrdersByClient />} />
        <Route path="/client-area/bluebay/aprovacao-financeira" element={<AprovacaoFinanceira />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
};

export default App;
