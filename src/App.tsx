import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { AdminLayout } from "./components/admin/AdminLayout";
import { Dashboard } from "./pages/admin/Dashboard";
import { Banners } from "./pages/admin/Banners";
import { Services } from "./pages/admin/Services";
import { Clients } from "./pages/admin/Clients";
import { Social } from "./pages/admin/Social";
import { Messages } from "./pages/admin/Messages";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="banners" element={<Banners />} />
            <Route path="services" element={<Services />} />
            <Route path="clients" element={<Clients />} />
            <Route path="social" element={<Social />} />
            <Route path="messages" element={<Messages />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;