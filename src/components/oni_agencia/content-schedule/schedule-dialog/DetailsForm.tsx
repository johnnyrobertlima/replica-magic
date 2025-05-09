
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ContentScheduleFormData } from "@/types/oni-agencia";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format, parse } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

interface DetailsFormProps {
  clientId: string;
  selectedDate: Date;
  services: any[];
  editorialLines: any[];
  products: any[];
  clients: any[];
  isLoadingServices: boolean;
  isLoadingEditorialLines: boolean;
  isLoadingProducts: boolean;
  isLoadingClients: boolean;
  formData: ContentScheduleFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onDateChange: (name: string, value: Date | null) => void;
  prioritizeCaptureDate?: boolean;
}

export function DetailsForm({
  clientId,
  selectedDate,
  services,
  editorialLines,
  products,
  clients,
  isLoadingServices,
  isLoadingEditorialLines,
  isLoadingProducts,
  isLoadingClients,
  formData,
  onInputChange,
  onSelectChange,
  onDateChange,
  prioritizeCaptureDate = false
}: DetailsFormProps) {
  // State to ensure calendar displays the correct date
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(
    formData.scheduled_date ? new Date(formData.scheduled_date) : selectedDate
  );
  
  // Update the calendar date when formData changes
  useEffect(() => {
    if (formData.scheduled_date) {
      try {
        const date = new Date(formData.scheduled_date);
        if (!isNaN(date.getTime())) {
          setCalendarDate(date);
        }
      } catch (e) {
        console.error("Error parsing date:", e);
      }
    } else {
      setCalendarDate(selectedDate);
    }
  }, [formData.scheduled_date, selectedDate]);
  
  // Function to handle date selection from calendar
  const handleCalendarSelect = (date: Date | null) => {
    setCalendarDate(date || undefined);
    onDateChange("scheduled_date", date);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Cliente</label>
        {isLoadingClients ? (
          <Skeleton className="w-full h-10" />
        ) : (
          <Select
            value={formData.client_id || ""}
            onValueChange={(value) => onSelectChange("client_id", value)}
            disabled={!!clientId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Título*</label>
        <Input
          name="title"
          value={formData.title || ""}
          onChange={onInputChange}
          placeholder="Título do agendamento"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Serviço*</label>
          {isLoadingServices ? (
            <Skeleton className="w-full h-10" />
          ) : (
            <Select
              value={formData.service_id || ""}
              onValueChange={(value) => onSelectChange("service_id", value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um serviço" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {prioritizeCaptureDate ? "Data de Agendamento (opcional)" : "Data de Agendamento*"}
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full pl-3 text-left font-normal",
                  !formData.scheduled_date && "text-muted-foreground"
                )}
              >
                {formData.scheduled_date ? (
                  format(new Date(formData.scheduled_date), "dd/MM/yyyy")
                ) : (
                  <span>Selecione uma data</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={calendarDate}
                onSelect={handleCalendarSelect}
                disabled={(date) => date < new Date("1900-01-01")}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {prioritizeCaptureDate && (
            <p className="text-xs text-muted-foreground mt-1">
              Nesta página, a data de agendamento é opcional. A data de captura será a principal.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Linha Editorial</label>
          {isLoadingEditorialLines ? (
            <Skeleton className="w-full h-10" />
          ) : (
            <Select
              value={formData.editorial_line_id || "null"}
              onValueChange={(value) => onSelectChange("editorial_line_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma linha editorial" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">Nenhum</SelectItem>
                {editorialLines.map((line) => (
                  <SelectItem key={line.id} value={line.id}>
                    {line.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Produto</label>
          {isLoadingProducts ? (
            <Skeleton className="w-full h-10" />
          ) : (
            <Select
              value={formData.product_id || "null"}
              onValueChange={(value) => onSelectChange("product_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">Nenhum</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descrição</label>
        <Textarea
          name="description"
          value={formData.description || ""}
          onChange={onInputChange}
          placeholder="Descrição do agendamento"
          rows={3}
        />
        {/* Display clickable links if description has URLs */}
        {formData.description && formData.description.match(/(https?:\/\/[^\s]+)/g) && (
          <div className="mt-2 text-sm">
            <p className="font-medium mb-1">Links detectados:</p>
            <div 
              className="p-2 bg-muted rounded-md" 
              dangerouslySetInnerHTML={{ __html: linkifyText(formData.description || "") }} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
