import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReachChart } from "@/components/content-management/ReachChart";
import { EngagementChart } from "@/components/content-management/EngagementChart";
import { ImpressionsChart } from "@/components/content-management/ImpressionsChart";
import { InsightsTable } from "@/components/content-management/InsightsTable";

const chartConfig = {
  reach: {
    theme: {
      light: "#8884d8",
      dark: "#8884d8",
    },
    label: "Alcance",
  },
  engajamento: {
    theme: {
      light: "#82ca9d",
      dark: "#82ca9d",
    },
    label: "Engajamento Médio",
  },
  impressoes: {
    theme: {
      light: "#0088FE",
      dark: "#0088FE",
    },
    label: "Impressões",
  },
};

const ContentManagement = () => {
  const { data: insights, isLoading, error } = useQuery({
    queryKey: ["social-insights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("insights_social")
        .select(`
          id,
          post_id,
          Cliente,
          message,
          permalink_url,
          created_time,
          post_impressions_paid,
          post_impressions_organic,
          post_clicks,
          post_video_views,
          post_video_views_organic,
          post_video_views_paid,
          total_comments,
          shares,
          views,
          likes,
          reelId,
          media_type,
          canal,
          comments,
          reelid,
          follows,
          profile_visits,
          reach,
          saved,
          total_interactions,
          timestamp
        `)
        .order("created_time", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Erro ao carregar dados</div>;
  }

  const reachData = insights?.map((insight) => ({
    date: new Date(insight.created_time || '').toLocaleDateString(),
    reach: insight.reach || 0,
    Canal: insight.canal || 'Desconhecido',
  })) || [];

  const engagementByChannel = insights?.reduce((acc, insight) => {
    const canal = insight.canal || 'Desconhecido';
    if (!acc[canal]) {
      acc[canal] = {
        Canal: canal,
        engajamento: 0,
        count: 0,
      };
    }
    acc[canal].engajamento += insight.total_interactions || 0;
    acc[canal].count += 1;
    return acc;
  }, {} as Record<string, { Canal: string; engajamento: number; count: number }>) || {};

  const engagementData = Object.values(engagementByChannel).map((item) => ({
    ...item,
    engajamento: item.count > 0 ? item.engajamento / item.count : 0,
  }));

  const impressionsByClient = insights?.reduce((acc, insight) => {
    const cliente = insight.Cliente || 'Desconhecido';
    if (!acc[cliente]) {
      acc[cliente] = {
        cliente,
        impressoes: 0,
      };
    }
    acc[cliente].impressoes += (insight.post_impressions_organic || 0) + (insight.post_impressions_paid || 0);
    return acc;
  }, {} as Record<string, { cliente: string; impressoes: number }>) || {};

  const impressionsData = Object.values(impressionsByClient);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Gestão de Conteúdo</h1>
      
      <div className="grid gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ReachChart data={reachData} chartConfig={chartConfig} />
          <EngagementChart data={engagementData} chartConfig={chartConfig} />
          <ImpressionsChart data={impressionsData} chartConfig={chartConfig} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Relatório de Desempenho nas Redes Sociais</CardTitle>
          </CardHeader>
          <CardContent>
            <InsightsTable insights={insights} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContentManagement;