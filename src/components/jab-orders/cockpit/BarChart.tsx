
import { lazy, Suspense, useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { LoadingChart } from "./LoadingChart";

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
  // State to handle client-side rendering of ApexCharts
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Bar chart options
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

  return (
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
  );
};
