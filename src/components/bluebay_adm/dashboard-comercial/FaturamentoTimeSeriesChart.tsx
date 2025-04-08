
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { differenceInMonths } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { DailyFaturamento, MonthlyFaturamento } from '@/services/bluebay/dashboardComercialTypes';

// Formatador de números para moeda brasileira
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-4 rounded-md shadow-md">
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-primary">
          {currencyFormatter.format(payload[0].value)}
        </p>
      </div>
    );
  }

  return null;
};

interface ChartData {
  label: string;
  value: number;
  formattedLabel: string;
}

interface FaturamentoChartProps {
  dailyData: DailyFaturamento[];
  monthlyData: MonthlyFaturamento[];
  startDate: Date;
  endDate: Date;
  isLoading: boolean;
}

export const FaturamentoTimeSeriesChart = ({
  dailyData,
  monthlyData,
  startDate,
  endDate,
  isLoading
}: FaturamentoChartProps) => {
  const chartData = useMemo(() => {
    // Determinar se deve usar dados diários ou mensais
    const monthsDiff = differenceInMonths(endDate, startDate);
    
    // Se o período for maior que 3 meses, usa dados mensais
    if (monthsDiff > 3) {
      return monthlyData.map(item => ({
        label: item.month,
        value: item.total,
        formattedLabel: item.formattedMonth
      }));
    } else {
      // Caso contrário, usa dados diários
      return dailyData.map(item => ({
        label: item.date,
        value: item.total,
        formattedLabel: item.formattedDate
      }));
    }
  }, [dailyData, monthlyData, startDate, endDate]);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Evolução de Faturamento</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 70,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="formattedLabel"
                angle={-45}
                textAnchor="end"
                height={70}
              />
              <YAxis
                tickFormatter={(value) => currencyFormatter.format(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
