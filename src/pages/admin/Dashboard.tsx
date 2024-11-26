import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Dashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [banners, services, clients, messages] = await Promise.all([
        supabase.from("banners").select("*", { count: "exact" }),
        supabase.from("services").select("*", { count: "exact" }),
        supabase.from("clients").select("*", { count: "exact" }),
        supabase.from("contact_submissions").select("*", { count: "exact" }),
      ]);

      return {
        banners: banners.count || 0,
        services: services.count || 0,
        clients: clients.count || 0,
        messages: messages.count || 0,
      };
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Banners</h3>
          <p className="mt-2 text-3xl font-bold">{stats?.banners || 0}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Serviços</h3>
          <p className="mt-2 text-3xl font-bold">{stats?.services || 0}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Clientes</h3>
          <p className="mt-2 text-3xl font-bold">{stats?.clients || 0}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Mensagens</h3>
          <p className="mt-2 text-3xl font-bold">{stats?.messages || 0}</p>
        </Card>
      </div>
    </div>
  );
};