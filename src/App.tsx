import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import Index from "./pages/Index";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <GoogleAnalytics />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/client-area" element={<ClientArea />} />
          <Route path="/client-area/whatsapp" element={<WhatsAppService />} />
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