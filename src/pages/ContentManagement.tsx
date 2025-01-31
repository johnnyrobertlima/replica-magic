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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Gestão de Conteúdo</h1>
      
      <div className="grid gap-6">
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