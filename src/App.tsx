
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import BluebayHome from "@/pages/BluebayHome";

// Admin imports
import { AdminLayout } from "@/pages/admin/layout";
import { AdminDashboard } from "@/pages/admin/dashboard";
import { AdminBanners } from "@/pages/admin/banners";
import { AdminClients } from "@/pages/admin/clients";
import { AdminLogos } from "@/pages/admin/logos";
import { AdminMessages } from "@/pages/admin/messages";
import { AdminSEO } from "@/pages/admin/seo";
import { AdminServices } from "@/pages/admin/services";
import { AdminSocial } from "@/pages/admin/social";
import { AdminLogin } from "@/pages/admin/login";
import { Outlet } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/client-area" element={<ClientArea />} />
        <Route path="/post-management" element={<PostManagement />} />
        <Route path="/client-area/bluebay" element={<BluebayHome />} />
        <Route path="/client-area/bluebay/jab-orders" element={<JabOrders />} />
        <Route path="/client-area/bluebay/jab-orders-by-client" element={<JabOrdersByClient />} />
        <Route path="/client-area/bluebay/aprovacao-financeira" element={<AprovacaoFinanceira />} />
        <Route path="/client-area/content-management" element={<ContentManagement />} />
        <Route path="/client-area/mailing-registration" element={<MailingRegistration />} />
        <Route path="/client-area/tokens" element={<TokenManagement />} />
        <Route path="/client-area/whatsapp-registration" element={<WhatsAppClientRegistration />} />
        <Route path="/client-area/whatsapp" element={<WhatsAppService />} />
        <Route path="/login" element={<ClientLogin />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout><Outlet /></AdminLayout>}>
          <Route index element={<AdminDashboard />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="clients" element={<AdminClients />} />
          <Route path="logos" element={<AdminLogos />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="seo" element={<AdminSEO />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="social" element={<AdminSocial />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
