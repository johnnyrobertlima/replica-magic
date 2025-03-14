
import { useState, useEffect } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MonthFilterSelectProps {
  onMonthSelect: (year: number, month: number) => void;
}

export const MonthFilterSelect = ({ onMonthSelect }: MonthFilterSelectProps) => {
  const [months, setMonths] = useState<{ label: string; value: string; year: number; month: number }[]>([]);
  
  useEffect(() => {
    // Generate last 12 months
    const currentDate = new Date();
    const monthOptions = Array.from({ length: 12 }, (_, i) => {
      const date = subMonths(currentDate, i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // JavaScript months are 0-indexed
      
      return {
        label: format(date, "MMMM yyyy", { locale: ptBR }),
        value: `${year}-${month.toString().padStart(2, '0')}`,
        year,
        month
      };
    });
    
    setMonths(monthOptions);
  }, []);

  const handleChange = (value: string) => {
    const selected = months.find(month => month.value === value);
    if (selected) {
      onMonthSelect(selected.year, selected.month);
    }
  };

  return (
    <div className="w-full max-w-xs">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Selecione o mês
      </label>
      <Select 
        defaultValue={months[0]?.value} 
        onValueChange={handleChange}
      >
        <SelectTrigger className="w-full bg-white border-input">
          <SelectValue placeholder="Selecione um mês" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {months.map((month) => (
            <SelectItem key={month.value} value={month.value} className="bg-white">
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
