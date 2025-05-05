
import { useState } from "react";
import { WorkloadFilters } from "./WorkloadFilters";
import { MonthWorkloadChart } from "./MonthWorkloadChart";
import { CollaboratorStatusGrid } from "./CollaboratorStatusGrid";

export function WorkloadDashboard() {
  const [clientId, setClientId] = useState<string | null>(null);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1); // Current month
  const [year, setYear] = useState<number>(new Date().getFullYear()); // Current year
  
  return (
    <div className="space-y-8">
      <WorkloadFilters
        selectedClient={clientId || ""}
        selectedMonth={month}
        selectedYear={year}
        onClientChange={setClientId}
        onMonthChange={setMonth}
        onYearChange={setYear}
      />
      
      <MonthWorkloadChart 
        events={[]} // We need to pass events here
        selectedMonth={month}
        selectedYear={year}
      />
      
      {/* New Collaborator Status Grid Section */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-4">Histórico de Alterações de Status</h3>
        <CollaboratorStatusGrid />
      </div>
    </div>
  );
}
