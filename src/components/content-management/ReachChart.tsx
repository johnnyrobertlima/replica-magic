import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, CartesianGrid, XAxis, YAxis, Legend, Line } from "recharts";

interface ReachChartProps {
  data: Array<{
    date: string;
    reach: number;
    canal: string;
  }>;
  chartConfig: any;
}

export const ReachChart = ({ data, chartConfig }: ReachChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alcance ao Longo do Tempo</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ChartContainer config={chartConfig}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
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
  );
};