
import { Routes, Route, Navigate } from "react-router-dom";
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
import BluebayHome from "@/pages/BluebayHome";
import BkHome from "@/pages/BkHome";
import BkClients from "@/pages/bk/BkClients"; // Import the BkClients component
import BkFinancial from "@/pages/bk/BkFinancial"; // Import the BkFinancial component

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
import { AdminGroups } from "@/pages/admin/groups";
import { AdminPermissions } from "@/pages/admin/permissions";
import { AdminLogin } from "@/pages/admin/login";
import { UserGroupManagement } from "@/pages/admin/users/UserGroupManagement";
import { Outlet } from "react-router-dom";
import { PermissionGuard } from "@/components/auth/PermissionGuard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<ClientLogin />} />
      
      {/* Client Area Routes - Protected */}
      <Route path="/client-area" element={
        <PermissionGuard resourcePath="/client-area">
          <ClientArea />
        </PermissionGuard>
      } />
      <Route path="/post-management" element={
        <PermissionGuard resourcePath="/post-management">
          <PostManagement />
        </PermissionGuard>
      } />
      
      {/* Bluebay Routes */}
      <Route path="/client-area/bluebay" element={
        <PermissionGuard resourcePath="/client-area/bluebay">
          <BluebayHome />
        </PermissionGuard>
      } />
      <Route path="/client-area/bluebay/jab-orders" element={
        <PermissionGuard resourcePath="/client-area/bluebay/jab-orders">
          <JabOrders />
        </PermissionGuard>
      } />
      <Route path="/client-area/bluebay/jab-orders-by-client" element={
        <PermissionGuard resourcePath="/client-area/bluebay/jab-orders-by-client">
          <JabOrdersByClient />
        </PermissionGuard>
      } />
      <Route path="/client-area/bluebay/jab-orders-by-representante" element={
        <PermissionGuard resourcePath="/client-area/bluebay/jab-orders-by-client">
          <JabOrdersByRepresentante />
        </PermissionGuard>
      } />
      <Route path="/client-area/bluebay/aprovacao-financeira" element={
        <PermissionGuard resourcePath="/client-area/bluebay/aprovacao-financeira">
          <AprovacaoFinanceira />
        </PermissionGuard>
      } />
      <Route path="/client-area/bluebay/acompanhamento-faturamento" element={
        <PermissionGuard resourcePath="/client-area/bluebay/aprovacao-financeira">
          <AcompanhamentoFaturamento />
        </PermissionGuard>
      } />
      
      {/* B&K Routes */}
      <Route path="/client-area/bk" element={
        <PermissionGuard resourcePath="/client-area/bk">
          <BkHome />
        </PermissionGuard>
      } />
      <Route path="/client-area/bk/clients" element={
        <PermissionGuard resourcePath="/client-area/bk">
          <BkClients />
        </PermissionGuard>
      } />
      <Route path="/client-area/bk/financial" element={
        <PermissionGuard resourcePath="/client-area/bk">
          <BkFinancial />
        </PermissionGuard>
      } />

      {/* Content Management Routes */}
      <Route path="/client-area/content-management" element={
        <PermissionGuard resourcePath="/client-area/content">
          <ContentManagement />
        </PermissionGuard>
      } />
      <Route path="/client-area/mailing-registration" element={
        <PermissionGuard resourcePath="/client-area/mailing">
          <MailingRegistration />
        </PermissionGuard>
      } />
      <Route path="/client-area/tokens" element={
        <PermissionGuard resourcePath="/client-area/tokens">
          <TokenManagement />
        </PermissionGuard>
      } />
      <Route path="/client-area/whatsapp-registration" element={
        <PermissionGuard resourcePath="/client-area/whatsapp">
          <WhatsAppClientRegistration />
        </PermissionGuard>
      } />
      <Route path="/client-area/whatsapp" element={
        <PermissionGuard resourcePath="/client-area/whatsapp">
          <WhatsAppService />
        </PermissionGuard>
      } />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout><Outlet /></AdminLayout>}>
        <Route index element={<AdminDashboard />} />
        <Route path="banners" element={
          <PermissionGuard resourcePath="/admin/banners">
            <AdminBanners />
          </PermissionGuard>
        } />
        <Route path="clients" element={
          <PermissionGuard resourcePath="/admin/clients">
            <AdminClients />
          </PermissionGuard>
        } />
        <Route path="groups" element={
          <PermissionGuard resourcePath="/admin" requiredPermission="admin">
            <AdminGroups />
          </PermissionGuard>
        } />
        <Route path="permissions" element={
          <PermissionGuard resourcePath="/admin" requiredPermission="admin">
            <AdminPermissions />
          </PermissionGuard>
        } />
        <Route path="users" element={
          <PermissionGuard resourcePath="/admin" requiredPermission="admin">
            <UserGroupManagement />
          </PermissionGuard>
        } />
        <Route path="logos" element={
          <PermissionGuard resourcePath="/admin/logos">
            <AdminLogos />
          </PermissionGuard>
        } />
        <Route path="messages" element={
          <PermissionGuard resourcePath="/admin/messages">
            <AdminMessages />
          </PermissionGuard>
        } />
        <Route path="seo" element={
          <PermissionGuard resourcePath="/admin/seo">
            <AdminSEO />
          </PermissionGuard>
        } />
        <Route path="services" element={
          <PermissionGuard resourcePath="/admin/services">
            <AdminServices />
          </PermissionGuard>
        } />
        <Route path="social" element={
          <PermissionGuard resourcePath="/admin/social">
            <AdminSocial />
          </PermissionGuard>
        } />
      </Route>
    </Routes>
  );
}

export default App;
