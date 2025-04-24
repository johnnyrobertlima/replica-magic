
import { useMemo } from "react";
import { CalendarEvent } from "@/types/oni-agencia";
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart } from "recharts";

interface MonthWorkloadChartProps {
  events: CalendarEvent[];
  selectedMonth: number;
  selectedYear: number;
}

export function MonthWorkloadChart({ events, selectedMonth, selectedYear }: MonthWorkloadChartProps) {
  const chartData = useMemo(() => {
    const collaboratorWorkload: Record<string, { name: string; tasks: number }> = {};

    // Filter events for selected month/year
    const filteredEvents = events.filter(event => {
      const eventDate = new Date(event.scheduled_date);
      return eventDate.getMonth() + 1 === selectedMonth && 
             eventDate.getFullYear() === selectedYear;
    });

    // Count tasks for each collaborator (both as main collaborator and creator)
    filteredEvents.forEach(event => {
      // Handle main collaborator
      if (event.collaborator) {
        const collabId = event.collaborator.id;
        if (!collaboratorWorkload[collabId]) {
          collaboratorWorkload[collabId] = {
            name: event.collaborator.name,
            tasks: 0
          };
        }
        collaboratorWorkload[collabId].tasks += 1;
      }

      // Handle creators
      if (event.creators) {
        event.creators.forEach(creatorId => {
          if (!collaboratorWorkload[creatorId]) {
            // Find creator name from any event where they are the main collaborator
            const creatorEvent = events.find(e => e.collaborator?.id === creatorId);
            collaboratorWorkload[creatorId] = {
              name: creatorEvent?.collaborator?.name || creatorId,
              tasks: 0
            };
          }
          collaboratorWorkload[creatorId].tasks += 1;
        });
      }
    });

    // Convert to array and sort by number of tasks
    return Object.values(collaboratorWorkload)
      .sort((a, b) => b.tasks - a.tasks);
  }, [events, selectedMonth, selectedYear]);

  if (chartData.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
        Nenhum dado disponível para o período selecionado
      </div>
    );
  }

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="tasks" name="Tarefas" fill="#8B5CF6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
