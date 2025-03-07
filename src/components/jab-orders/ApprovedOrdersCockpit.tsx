
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ChartContainer } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import dynamic from 'next/dynamic';
import { useEffect, useState } from "react";

// Dynamically import ApexCharts to avoid SSR issues
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface ApprovedOrdersCockpitProps {
  valorTotal: number;
  quantidadeItens: number;
  quantidadePedidos: number;
  valorFaltaFaturar: number;
  valorFaturado: number;
}

export const ApprovedOrdersCockpit = ({ 
  valorTotal, 
  quantidadeItens, 
  quantidadePedidos,
  valorFaltaFaturar,
  valorFaturado
}: ApprovedOrdersCockpitProps) => {
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="bg-white shadow-lg border-l-4 border-l-green-600">
          <CardContent className="pt-6 p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Valor Total Aprovado</h3>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(valorTotal)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-lg border-l-4 border-l-blue-600">
          <CardContent className="pt-6 p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Valor Faturado</h3>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(valorFaturado)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-lg border-l-4 border-l-amber-600">
          <CardContent className="pt-6 p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Falta Faturar</h3>
            <div className="text-2xl font-bold text-amber-600">
              {formatCurrency(valorFaltaFaturar)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-lg border-l-4 border-l-purple-600">
          <CardContent className="pt-6 p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Pedidos Aprovados</h3>
            <div className="text-2xl font-bold text-purple-600">
              {quantidadePedidos}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-lg border-l-4 border-l-indigo-600">
          <CardContent className="pt-6 p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Quantidade de Itens</h3>
            <div className="text-2xl font-bold text-indigo-600">
              {quantidadeItens}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white shadow-lg">
          <CardContent className="pt-6 p-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Progresso de Faturamento</h3>
            <div className="flex flex-col items-center">
              {mounted && (
                <ReactApexChart 
                  options={gaugeOptions as any}
                  series={[percentFaturado]}
                  type="radialBar"
                  height={350}
                />
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
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-lg">
          <CardContent className="pt-6 p-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Comparativo de Valores</h3>
            <div className="h-[350px] w-full">
              {mounted && (
                <ReactApexChart 
                  options={barOptions as any}
                  series={barSeries}
                  type="bar"
                  height={350}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
