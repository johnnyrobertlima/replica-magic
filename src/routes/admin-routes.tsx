
import { Route } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
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
import AdminRequests from "@/pages/admin/requests";
import AdminSubThemes from "@/pages/admin/sub-themes";
import AdminIconsPage from "@/pages/admin/icons";

export const adminRoutes = (
  <>
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
      <Route path="requests" element={
        <PermissionGuard resourcePath="/admin/requests">
          <AdminRequests />
        </PermissionGuard>
      } />
      <Route path="sub-themes" element={
        <PermissionGuard resourcePath="/admin/sub-themes">
          <AdminSubThemes />
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
      <Route path="icons" element={
        <PermissionGuard resourcePath="/admin" requiredPermission="admin">
          <AdminIconsPage />
        </PermissionGuard>
      } />
    </Route>
  </>
);
