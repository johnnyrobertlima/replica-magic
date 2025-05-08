
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ContentScheduleFormData } from "@/types/oni-agencia";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { SkeletonInput } from "@/components/ui/skeleton";

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
  return (
    <div className="space-y-4">
      <FormField>
        <FormLabel>Cliente</FormLabel>
        <FormControl>
          {isLoadingClients ? (
            <SkeletonInput className="w-full h-10" />
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
        </FormControl>
      </FormField>

      <FormField>
        <FormLabel>Título*</FormLabel>
        <FormControl>
          <Input
            name="title"
            value={formData.title || ""}
            onChange={onInputChange}
            placeholder="Título do agendamento"
            required
          />
        </FormControl>
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField>
          <FormLabel>Serviço*</FormLabel>
          <FormControl>
            {isLoadingServices ? (
              <SkeletonInput className="w-full h-10" />
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
          </FormControl>
        </FormField>

        <FormField>
          <FormLabel>{prioritizeCaptureDate ? "Data de Agendamento (opcional)" : "Data de Agendamento*"}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
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
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.scheduled_date ? new Date(formData.scheduled_date) : undefined}
                onSelect={(date) => onDateChange("scheduled_date", date)}
                disabled={(date) => date < new Date("1900-01-01")}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {prioritizeCaptureDate && (
            <FormDescription>
              Nesta página, a data de agendamento é opcional. A data de captura será a principal.
            </FormDescription>
          )}
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField>
          <FormLabel>Linha Editorial</FormLabel>
          <FormControl>
            {isLoadingEditorialLines ? (
              <SkeletonInput className="w-full h-10" />
            ) : (
              <Select
                value={formData.editorial_line_id || ""}
                onValueChange={(value) => onSelectChange("editorial_line_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma linha editorial" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {editorialLines.map((line) => (
                    <SelectItem key={line.id} value={line.id}>
                      {line.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormControl>
        </FormField>

        <FormField>
          <FormLabel>Produto</FormLabel>
          <FormControl>
            {isLoadingProducts ? (
              <SkeletonInput className="w-full h-10" />
            ) : (
              <Select
                value={formData.product_id || ""}
                onValueChange={(value) => onSelectChange("product_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormControl>
        </FormField>
      </div>

      <FormField>
        <FormLabel>Descrição</FormLabel>
        <FormControl>
          <Textarea
            name="description"
            value={formData.description || ""}
            onChange={onInputChange}
            placeholder="Descreva o agendamento"
            rows={4}
          />
        </FormControl>
      </FormField>
    </div>
  );
}
