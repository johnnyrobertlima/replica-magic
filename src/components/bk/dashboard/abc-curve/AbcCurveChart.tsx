
import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface DataItem {
  name: string;
  value: number;
}

interface AbcCurveChartProps {
  data: DataItem[];
  title: string;
  description?: string;
  valueFormatter?: (value: number) => string;
  isLoading?: boolean;
}

export const AbcCurveChart = ({
  data,
  title,
  description,
  valueFormatter = formatCurrency,
  isLoading = false
}: AbcCurveChartProps) => {
  const processedData = useMemo(() => {
    if (!data.length) return [];
    
    // Sort data by value in descending order
    const sortedData = [...data].sort((a, b) => b.value - a.value);
    
    // Calculate total value
    const totalValue = sortedData.reduce((sum, item) => sum + item.value, 0);
    
    // Calculate cumulative percentages and add ABC classification
    let cumulativeValue = 0;
    let cumulativePercent = 0;
    
    return sortedData.map((item, index) => {
      cumulativeValue += item.value;
      const previousPercent = cumulativePercent;
      cumulativePercent = (cumulativeValue / totalValue) * 100;
      
      // ABC Classification
      let classification;
      if (cumulativePercent <= 80) classification = 'A';
      else if (cumulativePercent <= 95) classification = 'B';
      else classification = 'C';
      
      return {
        name: item.name,
        value: item.value,
        percentage: (item.value / totalValue) * 100,
        cumulative: cumulativePercent,
        previousCumulative: previousPercent,
        classification
      };
    });
  }, [data]);

  // Get the top 15 items to display
  const limitedData = useMemo(() => 
    processedData.slice(0, 15), 
  [processedData]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="w-full h-[300px] bg-white rounded-lg flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : processedData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              data={limitedData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                yAxisId="left"
                tickFormatter={(value) => `${value.toFixed(0)}%`}
                domain={[0, 100]}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tickFormatter={valueFormatter}
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'value') return [valueFormatter(value as number), 'Valor'];
                  if (name === 'cumulative') return [`${(value as number).toFixed(1)}%`, 'Acumulado'];
                  return [value, name];
                }}
                labelFormatter={(label) => `${label}`}
              />
              <Legend />
              <Bar 
                dataKey="value" 
                fill="#8884d8" 
                yAxisId="right"
                name="Valor"
              />
              <Line 
                type="monotone" 
                dataKey="cumulative" 
                stroke="#ff7300" 
                yAxisId="left"
                name="% Acumulado"
                dot={{ strokeWidth: 2, r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-[300px] bg-white rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Não há dados disponíveis para visualização</p>
          </div>
        )}
        
        {/* Legend for ABC Classification */}
        {processedData.length > 0 && (
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
              <span className="text-xs">A (0-80%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
              <span className="text-xs">B (80-95%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
              <span className="text-xs">C (95-100%)</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
