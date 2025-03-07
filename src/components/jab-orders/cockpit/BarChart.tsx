
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { lazy, Suspense, useState, useEffect } from "react";

// Lazy load ApexCharts to avoid issues with SSR/window object
const ReactApexChart = lazy(() => import('react-apexcharts'));

interface BarChartProps {
  valorTotal: number;
  valorFaturado: number;
  valorFaltaFaturar: number;
}

export const BarChart = ({ 
  valorTotal, 
  valorFaturado, 
  valorFaltaFaturar 
}: BarChartProps) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const barOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: false
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        columnWidth: '55%',
      },
    },
    dataLabels: {
      enabled: false
    },
    colors: ['#16a34a', '#2563eb', '#d97706'],
    xaxis: {
      categories: ['Valor Total Aprovado', 'Valor Faturado', 'Falta Faturar'],
    },
    yaxis: {
      labels: {
        formatter: function (value: number) {
          return formatCurrency(value);
        }
      }
    },
    tooltip: {
      y: {
        formatter: function (value: number) {
          return formatCurrency(value);
        }
      }
    }
  };
  
  // Bar chart series
  const barSeries = [
    {
      name: 'Valor',
      data: [valorTotal, valorFaturado, valorFaltaFaturar]
    }
  ];
  
  // Loading indicator for the chart
  const LoadingChart = () => (
    <div className="flex items-center justify-center h-[350px] w-full">
      <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
    </div>
  );
  
  return (
    <Card className="bg-white shadow-lg">
      <CardContent className="pt-6 p-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Comparativo de Valores</h3>
        <div className="h-[350px] w-full">
          {mounted && (
            <Suspense fallback={<LoadingChart />}>
              <ReactApexChart 
                options={barOptions as any}
                series={barSeries}
                type="bar"
                height={350}
              />
            </Suspense>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
