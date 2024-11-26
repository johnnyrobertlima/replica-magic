import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageSquare, Image, Globe } from "lucide-react";
import { Loader2 } from "lucide-react";

export const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [
        { count: bannersCount },
        { count: servicesCount },
        { count: clientsCount },
        { count: messagesCount },
      ] = await Promise.all([
        supabase.from("banners").select("*", { count: "exact", head: true }),
        supabase.from("services").select("*", { count: "exact", head: true }),
        supabase.from("clients").select("*", { count: "exact", head: true }),
        supabase.from("contact_messages").select("*", { count: "exact", head: true }),
      ]);

      return {
        banners: bannersCount || 0,
        services: servicesCount || 0,
        clients: clientsCount || 0,
        messages: messagesCount || 0,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const cards = [
    { title: "Clientes", value: stats?.clients || 0, icon: Users },
    { title: "Mensagens", value: stats?.messages || 0, icon: MessageSquare },
    { title: "Banners", value: stats?.banners || 0, icon: Image },
    { title: "Serviços", value: stats?.services || 0, icon: Globe },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};