
import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CalendarEvent } from "@/types/oni-agencia";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MonthWorkloadChartProps {
  events: CalendarEvent[];
  selectedMonth: number;
  selectedYear: number;
  isLoading?: boolean;
}

export function MonthWorkloadChart({ 
  events, 
  selectedMonth, 
  selectedYear,
  isLoading = false
}: MonthWorkloadChartProps) {
  // Otimização com useMemo para evitar recálculos desnecessários
  const chartData = useMemo(() => {
    // Dicionário para mapear nomes dos serviços aos seus IDs e cores
    const serviceMap: Record<string, { id: string; color: string }> = {};
    
    // Inicializar o mapa de serviços a partir dos eventos
    events.forEach(event => {
      if (event.service) {
        const { id, name, color } = event.service;
        serviceMap[name] = { id, color: color || '#888888' };
      }
    });
    
    // Criar um mapa de contagem por colaborador
    const collaboratorData: Record<string, Record<string, number>> = {};
    
    events.forEach(event => {
      if (!event.collaborator || !event.service) return;
      
      const collabName = event.collaborator.name;
      const serviceName = event.service.name;
      
      if (!collaboratorData[collabName]) {
        collaboratorData[collabName] = {};
      }
      
      if (!collaboratorData[collabName][serviceName]) {
        collaboratorData[collabName][serviceName] = 0;
      }
      
      collaboratorData[collabName][serviceName]++;
    });
    
    // Converter para o formato esperado pelo gráfico
    return Object.entries(collaboratorData).map(([name, services]) => {
      const result: Record<string, any> = { name };
      
      Object.entries(services).forEach(([service, count]) => {
        result[service] = count;
      });
      
      return result;
    });
  }, [events]);
  
  // Obter todas as chaves de serviços para renderizar as barras
  const serviceKeys = useMemo(() => {
    const keys = new Set<string>();
    
    chartData.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== 'name') {
          keys.add(key);
        }
      });
    });
    
    return Array.from(keys);
  }, [chartData]);
  
  // Obter as cores para cada serviço
  const serviceColors = useMemo(() => {
    const colors: Record<string, string> = {};
    
    events.forEach(event => {
      if (event.service) {
        colors[event.service.name] = event.service.color || '#888888';
      }
    });
    
    return colors;
  }, [events]);
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Carga de Trabalho Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Carga de Trabalho Mensal</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex justify-center items-center h-[300px]">
            <p className="text-muted-foreground">Nenhum dado disponível para o período selecionado</p>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                {serviceKeys.map(key => (
                  <Bar
                    key={key}
                    dataKey={key}
                    stackId="a"
                    fill={serviceColors[key] || '#888888'}
                    name={key}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
