import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import ClientLogin from "./pages/ClientLogin";
import { AdminLayout } from "./pages/admin/layout";
import { AdminLogin } from "./pages/admin/login";
import { AdminDashboard } from "./pages/admin/dashboard";
import { AdminBanners } from "./pages/admin/banners";
import { AdminServices } from "./pages/admin/services";
import { AdminClients } from "./pages/admin/clients";
import { AdminSocial } from "./pages/admin/social";
import { AdminLogos } from "./pages/admin/logos";
import { AdminMessages } from "./pages/admin/messages";
import { AdminSEO } from "./pages/admin/seo";
import ClientArea from "./pages/ClientArea";
import WhatsAppService from "./pages/WhatsAppService";
import TokenManagement from "./pages/TokenManagement";
import WhatsAppClientRegistration from "./pages/WhatsAppClientRegistration";
import MailingRegistration from "./pages/MailingRegistration";
import ContentManagement from "./pages/ContentManagement";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return null; // or a loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/client-login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <GoogleAnalytics />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/client-login" element={<ClientLogin />} />
          
          {/* Protected Client Routes */}
          <Route path="/client-area" element={<ProtectedRoute><ClientArea /></ProtectedRoute>} />
          <Route path="/client-area/whatsapp" element={<ProtectedRoute><WhatsAppService /></ProtectedRoute>} />
          <Route path="/client-area/tokens" element={<ProtectedRoute><TokenManagement /></ProtectedRoute>} />
          <Route path="/client-area/whatsapp-registration" element={<ProtectedRoute><WhatsAppClientRegistration /></ProtectedRoute>} />
          <Route path="/client-area/mailing-registration" element={<ProtectedRoute><MailingRegistration /></ProtectedRoute>} />
          <Route path="/client-area/content-management" element={<ProtectedRoute><ContentManagement /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout><Outlet /></AdminLayout>}>
            <Route index element={<AdminDashboard />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="social" element={<AdminSocial />} />
            <Route path="logos" element={<AdminLogos />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="seo" element={<AdminSEO />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;