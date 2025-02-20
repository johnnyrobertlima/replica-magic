import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ClientArea from "./pages/ClientArea";
import WhatsAppCampaign from "./pages/WhatsAppCampaign";
import TokenRegistration from "./pages/TokenRegistration";
import WhatsAppRegistration from "./pages/WhatsAppRegistration";
import MailingRegistration from "./pages/MailingRegistration";
import ContentManagement from "./pages/ContentManagement";
import PostManagement from "./pages/PostManagement";
import JabOrders from "@/pages/JabOrders";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/client-area" element={<ClientArea />} />
        <Route path="/client-area/whatsapp" element={<WhatsAppCampaign />} />
        <Route path="/client-area/tokens" element={<TokenRegistration />} />
        <Route path="/client-area/whatsapp-registration" element={<WhatsAppRegistration />} />
        <Route path="/client-area/mailing-registration" element={<MailingRegistration />} />
        <Route path="/client-area/content-management" element={<ContentManagement />} />
        <Route path="/post-management" element={<PostManagement />} />
        <Route path="/client-area/bluebay/jab-orders" element={<JabOrders />} />
      </Routes>
    </Router>
  );
}

export default App;
