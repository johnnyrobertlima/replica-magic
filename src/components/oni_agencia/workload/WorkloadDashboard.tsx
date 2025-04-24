
import { useState } from "react";
import { useAllContentSchedules } from "@/hooks/useOniAgenciaContentSchedules";
import { MonthWorkloadChart } from "./MonthWorkloadChart";
import { WorkloadFilters } from "./WorkloadFilters";
import { useClients } from "@/hooks/useOniAgenciaClients";

export function WorkloadDashboard() {
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const { data: clients = [] } = useClients();
  const { data: events = [], isLoading } = useAllContentSchedules(selectedClient);

  return (
    <div className="space-y-6">
      <WorkloadFilters
        selectedClient={selectedClient}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onClientChange={setSelectedClient}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
      />
      
      <div className="bg-white rounded-lg border shadow p-6">
        <MonthWorkloadChart 
          events={events} 
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      </div>
    </div>
  );
}
