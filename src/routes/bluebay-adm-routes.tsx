
import { Route } from "react-router-dom";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import BluebayAdmHome from "@/pages/BluebayAdmHome";

export const bluebayAdmRoutes = (
  <>
    <Route path="/client-area/bluebay_adm" element={
      <PermissionGuard resourcePath="/client-area/bluebay_adm">
        <BluebayAdmHome />
      </PermissionGuard>
    } />
  </>
);
