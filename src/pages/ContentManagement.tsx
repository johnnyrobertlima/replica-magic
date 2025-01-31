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

const ContentManagement = () => {
  const { data: insights, isLoading } = useQuery({
    queryKey: ["social-insights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("insights_social")
        .select("*")
        .order("created_time", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Prepare data for reach over time chart
  const reachData = insights?.map((insight) => ({
    date: new Date(insight.created_time).toLocaleDateString(),
    reach: insight.reach || 0,
    canal: insight.Canal,
  }));

  // Prepare data for engagement by channel
  const engagementByChannel = insights?.reduce((acc, insight) => {
    if (!acc[insight.Canal]) {
      acc[insight.Canal] = {
        canal: insight.Canal,
        engajamento: 0,
        count: 0,
      };
    }
    acc[insight.Canal].engajamento += insight.total_interactions || 0;
    acc[insight.Canal].count += 1;
    return acc;
  }, {});

  const engagementData = Object.values(engagementByChannel || {}).map((item: any) => ({
    ...item,
    engajamento: item.engajamento / item.count, // Calculate average
  }));

  // Prepare data for impressions by client
  const impressionsByClient = insights?.reduce((acc, insight) => {
    if (!acc[insight.Cliente]) {
      acc[insight.Cliente] = {
        cliente: insight.Cliente,
        impressoes: 0,
      };
    }
    acc[insight.Cliente].impressoes += insight.post_impressions || 0;
    return acc;
  }, {});

  const impressionsData = Object.values(impressionsByClient || {});

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
              <ChartContainer>
                <LineChart data={reachData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="reach" 
                    stroke="#8884d8" 
                    name="Alcance"
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
              <ChartContainer>
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="canal" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="engajamento" 
                    fill="#82ca9d"
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
              <ChartContainer>
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
                  <Tooltip />
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
                    <TableCell>{insight.Canal}</TableCell>
                    <TableCell>{insight.Cliente}</TableCell>
                    <TableCell>{insight.post_impressions?.toLocaleString()}</TableCell>
                    <TableCell>{insight.reach?.toLocaleString()}</TableCell>
                    <TableCell>{insight.total_interactions?.toLocaleString()}</TableCell>
                    <TableCell>
                      {insight.created_time && new Date(insight.created_time).toLocaleDateString()}
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