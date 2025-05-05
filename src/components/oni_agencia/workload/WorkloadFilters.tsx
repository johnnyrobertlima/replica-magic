
import { ClientSelect } from "@/components/oni_agencia/workload/ClientSelect";
import { MonthSelect } from "@/components/oni_agencia/workload/MonthSelect";
import { YearSelect } from "@/components/oni_agencia/workload/YearSelect";

export interface WorkloadFiltersProps {
  selectedClient: string;
  selectedMonth: number;
  selectedYear: number;
  onClientChange: (clientId: string) => void;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

export function WorkloadFilters({
  selectedClient,
  selectedMonth,
  selectedYear,
  onClientChange,
  onMonthChange,
  onYearChange
}: WorkloadFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg border shadow-sm">
      <div className="flex-1 min-w-[200px]">
        <ClientSelect
          value={selectedClient}
          onChange={onClientChange}
        />
      </div>
      <div className="w-32">
        <MonthSelect
          value={selectedMonth}
          onChange={onMonthChange}
        />
      </div>
      <div className="w-32">
        <YearSelect
          value={selectedYear}
          onChange={onYearChange}
        />
      </div>
    </div>
  );
}
