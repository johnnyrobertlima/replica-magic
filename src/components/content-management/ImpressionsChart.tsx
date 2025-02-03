import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Legend, Cell } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

interface ImpressionsChartProps {
  data: Array<{
    cliente: string;
    impressoes: number;
  }>;
  chartConfig: any;
}

export const ImpressionsChart = ({ data, chartConfig }: ImpressionsChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição de Impressões por Cliente</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ChartContainer config={chartConfig}>
          <PieChart>
            <Pie
              data={data}
              dataKey="impressoes"
              nameKey="cliente"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};