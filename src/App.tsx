
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import ClientArea from "@/pages/ClientArea";
import ClientLogin from "@/pages/ClientLogin";
import JabOrders from "@/pages/JabOrders";
import JabOrdersByClient from "@/pages/JabOrdersByClient";
import ContentManagement from "@/pages/ContentManagement";
import PostManagement from "@/pages/PostManagement";
import TokenManagement from "@/pages/TokenManagement";
import WhatsAppService from "@/pages/WhatsAppService";
import WhatsAppClientRegistration from "@/pages/WhatsAppClientRegistration";
import MailingRegistration from "@/pages/MailingRegistration";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminClients from "@/pages/admin/clients";
import AdminServices from "@/pages/admin/services";
import AdminBanners from "@/pages/admin/banners";
import AdminLogin from "@/pages/admin/login";
import AdminSeo from "@/pages/admin/seo";
import AdminMessages from "@/pages/admin/messages";
import AdminSocial from "@/pages/admin/social";
import AdminLogos from "@/pages/admin/logos";
import AdminLayout from "@/pages/admin/layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/client-area" element={<ClientArea />} />
        <Route path="/client-login" element={<ClientLogin />} />
        <Route path="/client-area/bluebay/jab-orders" element={<JabOrders />} />
        <Route path="/client-area/bluebay/jab-orders-by-client" element={<JabOrdersByClient />} />
        <Route path="/client-area/content-management" element={<ContentManagement />} />
        <Route path="/client-area/post-management" element={<PostManagement />} />
        <Route path="/client-area/whatsapp-service" element={<WhatsAppService />} />
        <Route path="/client-area/token-management" element={<TokenManagement />} />
        <Route path="/client-area/whatsapp-client-registration" element={<WhatsAppClientRegistration />} />
        <Route path="/mailing-registration" element={<MailingRegistration />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="clients" element={<AdminClients />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="seo" element={<AdminSeo />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="social" element={<AdminSocial />} />
          <Route path="logos" element={<AdminLogos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
