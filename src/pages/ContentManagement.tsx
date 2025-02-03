import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

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
        .select("*")
        .order("created_time", { ascending: false });

      if (error) throw error;
      return data || []; // Ensure we always return an array
    },
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Erro ao carregar dados</div>;
  }

  // Prepare data for reach over time chart
  const reachData = insights?.map((insight) => ({
    date: new Date(insight.created_time || '').toLocaleDateString(),
    reach: insight.reach || 0,
    canal: insight.Canal || '',
  })) || [];

  // Prepare data for engagement by channel
  const engagementByChannel = insights?.reduce((acc, insight) => {
    const canal = insight.Canal || 'Desconhecido';
    if (!acc[canal]) {
      acc[canal] = {
        canal,
        engajamento: 0,
        count: 0,
      };
    }
    acc[canal].engajamento += insight.total_interactions || 0;
    acc[canal].count += 1;
    return acc;
  }, {} as Record<string, { canal: string; engajamento: number; count: number }>) || {};

  const engagementData = Object.values(engagementByChannel).map((item) => ({
    ...item,
    engajamento: item.count > 0 ? item.engajamento / item.count : 0,
  }));

  // Prepare data for impressions by client
  const impressionsByClient = insights?.reduce((acc, insight) => {
    const cliente = insight.Cliente || 'Desconhecido';
    if (!acc[cliente]) {
      acc[cliente] = {
        cliente,
        impressoes: 0,
      };
    }
    acc[cliente].impressoes += insight.post_impressions || 0;
    return acc;
  }, {} as Record<string, { cliente: string; impressoes: number }>) || {};

  const impressionsData = Object.values(impressionsByClient);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Gestão de Conteúdo</h1>
      
      <div className="grid gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Alcance ao Longo do Tempo</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ChartContainer config={chartConfig}>
                <LineChart data={reachData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="reach" 
                    name="Alcance"
                    stroke={chartConfig.reach.theme.light}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Engajamento Médio por Canal</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ChartContainer config={chartConfig}>
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="canal" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar 
                    dataKey="engajamento" 
                    fill={chartConfig.engajamento.theme.light}
                    name="Engajamento Médio"
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Impressões por Cliente</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ChartContainer config={chartConfig}>
                <PieChart>
                  <Pie
                    data={impressionsData}
                    dataKey="impressoes"
                    nameKey="cliente"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {impressionsData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Relatório de Desempenho nas Redes Sociais</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Canal</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Impressões</TableHead>
                  <TableHead>Alcance</TableHead>
                  <TableHead>Engajamento</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {insights?.map((insight) => (
                  <TableRow key={insight.id}>
                    <TableCell>{insight.Canal || '-'}</TableCell>
                    <TableCell>{insight.Cliente || '-'}</TableCell>
                    <TableCell>{insight.post_impressions?.toLocaleString() || '0'}</TableCell>
                    <TableCell>{insight.reach?.toLocaleString() || '0'}</TableCell>
                    <TableCell>{insight.total_interactions?.toLocaleString() || '0'}</TableCell>
                    <TableCell>
                      {insight.created_time ? new Date(insight.created_time).toLocaleDateString() : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContentManagement;