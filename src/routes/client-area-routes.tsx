
import { Route } from "react-router-dom";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import ClientArea from "@/pages/ClientArea";
import PostManagement from "@/pages/PostManagement";
import ContentManagement from "@/pages/ContentManagement";
import MailingRegistration from "@/pages/MailingRegistration";
import TokenManagement from "@/pages/TokenManagement";
import WhatsAppClientRegistration from "@/pages/WhatsAppClientRegistration";
import WhatsAppService from "@/pages/WhatsAppService";
import { BluebayRoutes } from "./bluebay-routes";
import { BkRoutes } from "./bk-routes";

export function ClientAreaRoutes() {
  return (
    <>
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
      
      <BluebayRoutes />
      <BkRoutes />
    </>
  );
}
