
import { lazy, Suspense, useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { LoadingChart } from "./LoadingChart";

// Lazy load ApexCharts to avoid issues with SSR/window object
const ReactApexChart = lazy(() => import('react-apexcharts'));

interface GaugeChartProps {
  valorTotal: number;
  valorFaturado: number;
  valorFaltaFaturar: number;
}

export const GaugeChart = ({ 
  valorTotal, 
  valorFaturado, 
  valorFaltaFaturar 
}: GaugeChartProps) => {
  // Calculate percentage for gauge
  const percentFaturado = valorTotal > 0 ? (valorFaturado / valorTotal) * 100 : 0;
  
  // State to handle client-side rendering of ApexCharts
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Gauge chart options
  const gaugeOptions = {
    chart: {
      type: 'radialBar',
      height: 350,
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: {
          margin: 0,
          size: '70%',
        },
        track: {
          background: '#e7e7e7',
          strokeWidth: '97%',
          margin: 5, 
          dropShadow: {
            enabled: true,
            top: 2,
            left: 0,
            blur: 4,
            opacity: 0.15
          }
        },
        dataLabels: {
          name: {
            offsetY: -10,
            color: '#333',
            fontSize: '16px',
            fontWeight: 600,
            fontFamily: 'inherit',
          },
          value: {
            offsetY: 5,
            color: '#2563eb',
            fontSize: '22px',
            fontWeight: 700,
            formatter: function(val: number) {
              return formatCurrency(valorFaturado) + ' (' + val.toFixed(1) + '%)';
            }
          },
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        gradientToColors: ['#16a34a'],
        stops: [0, 100]
      }
    },
    stroke: {
      lineCap: 'round'
    },
    labels: ['Valor Faturado'],
    colors: ['#2563eb'],
  };

  return (
    <div className="flex flex-col items-center">
      {mounted && (
        <Suspense fallback={<LoadingChart />}>
          <ReactApexChart 
            options={gaugeOptions as any}
            series={[percentFaturado]}
            type="radialBar"
            height={350}
          />
        </Suspense>
      )}
      <div className="w-full mt-4">
        <div className="flex justify-between mb-2 text-sm">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
        <Progress value={percentFaturado} className="h-2" />
        <div className="flex justify-between mt-4 text-sm text-gray-500">
          <span>Total: {formatCurrency(valorTotal)}</span>
          <span>Falta: {formatCurrency(valorFaltaFaturar)}</span>
        </div>
      </div>
    </div>
  );
};
