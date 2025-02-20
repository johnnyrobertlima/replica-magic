
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Index from "@/pages/Index";
import ClientArea from "@/pages/ClientArea";
import PostManagement from "@/pages/PostManagement";
import JabOrders from "@/pages/JabOrders";
import ContentManagement from "@/pages/ContentManagement";
import MailingRegistration from "@/pages/MailingRegistration";
import TokenManagement from "@/pages/TokenManagement";
import WhatsAppClientRegistration from "@/pages/WhatsAppClientRegistration";
import WhatsAppService from "@/pages/WhatsAppService";
import ClientLogin from "@/pages/ClientLogin";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/client-area" element={<ClientArea />} />
        <Route path="/post-management" element={<PostManagement />} />
        <Route path="/client-area/bluebay/jab-orders" element={<JabOrders />} />
        <Route path="/client-area/content-management" element={<ContentManagement />} />
        <Route path="/client-area/mailing-registration" element={<MailingRegistration />} />
        <Route path="/client-area/tokens" element={<TokenManagement />} />
        <Route path="/client-area/whatsapp-registration" element={<WhatsAppClientRegistration />} />
        <Route path="/client-area/whatsapp" element={<WhatsAppService />} />
        <Route path="/login" element={<ClientLogin />} />
      </Routes>
    </Router>
  );
}

export default App;

