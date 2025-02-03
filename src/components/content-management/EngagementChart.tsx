import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, CartesianGrid, XAxis, YAxis, Legend, Bar } from "recharts";

interface EngagementChartProps {
  data: Array<{
    canal: string;
    engajamento: number;
    count: number;
  }>;
  chartConfig: any;
}

export const EngagementChart = ({ data, chartConfig }: EngagementChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Engajamento Médio por Canal</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ChartContainer config={chartConfig}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="canal" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
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
  );
};