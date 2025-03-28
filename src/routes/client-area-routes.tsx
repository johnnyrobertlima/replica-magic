
import { Route } from "react-router-dom";
import { Fragment } from "react";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import ClientArea from "@/pages/ClientArea";
import PostManagement from "@/pages/PostManagement";
import ContentManagement from "@/pages/ContentManagement";
import MailingRegistration from "@/pages/MailingRegistration";
import TokenManagement from "@/pages/TokenManagement";
import WhatsAppClientRegistration from "@/pages/WhatsAppClientRegistration";
import WhatsAppService from "@/pages/WhatsAppService";
import Representantes from "@/pages/Representantes";
import { bluebayRoutes } from "./bluebay-routes";
import { bkRoutes } from "./bk-routes";
import { bluebayAdmRoutes } from "./bluebay-adm-routes"; // Adicionar esta importação

export const clientAreaRoutes = (
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
    <Route path="/client-area/representantes" element={
      <PermissionGuard resourcePath="/client-area/representantes">
        <Representantes />
      </PermissionGuard>
    } />
    
    {bluebayRoutes}
    {bkRoutes}
    {bluebayAdmRoutes} {/* Adicionar esta linha */}
  </>
);
