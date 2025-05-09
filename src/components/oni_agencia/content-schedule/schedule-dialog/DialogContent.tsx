
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarEvent, ContentScheduleFormData } from "@/types/oni-agencia";
import { DetailsForm } from "./DetailsForm";
import { StatusForm } from "./StatusForm";
import { HistoryView } from "./HistoryView";
import { CaptureForm } from "./CaptureForm";

interface DialogContentProps {
  selectedEvent?: CalendarEvent;
  events: CalendarEvent[];
  currentSelectedEvent: CalendarEvent | null;
  clientId: string;
  selectedDate: Date;
  services: any[];
  collaborators: any[];
  editorialLines: any[];
  products: any[];
  statuses: any[];
  clients: any[];
  isLoadingServices: boolean;
  isLoadingCollaborators: boolean;
  isLoadingEditorialLines: boolean;
  isLoadingProducts: boolean;
  isLoadingStatuses: boolean;
  isLoadingClients: boolean;
  isSubmitting: boolean;
  isDeleting: boolean;
  formData: ContentScheduleFormData;
  onSelectEvent: (event: CalendarEvent) => void;
  onResetForm: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onStatusUpdate: (e: React.FormEvent) => void;
  onDelete: () => void;
  onCancel: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onDateChange: (name: string, value: Date | null) => void;
  onDateTimeChange: (name: string, value: Date | null) => void;
  onAllDayChange: (value: boolean) => void;
  defaultTab?: "details" | "status" | "history" | "capture";
  prioritizeCaptureDate?: boolean;
}

export function DialogContent({
  selectedEvent,
  events,
  currentSelectedEvent,
  clientId,
  selectedDate,
  services,
  collaborators,
  editorialLines,
  products,
  statuses,
  clients,
  isLoadingServices,
  isLoadingCollaborators,
  isLoadingEditorialLines,
  isLoadingProducts,
  isLoadingStatuses,
  isLoadingClients,
  isSubmitting,
  isDeleting,
  formData,
  onSelectEvent,
  onResetForm,
  onSubmit,
  onStatusUpdate,
  onDelete,
  onCancel,
  onInputChange,
  onSelectChange,
  onDateChange,
  onDateTimeChange,
  onAllDayChange,
  defaultTab = "details",
  prioritizeCaptureDate = false
}: DialogContentProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  const handleStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    onStatusUpdate(e);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-4 mb-4">
        <TabsTrigger value="details">Detalhes</TabsTrigger>
        <TabsTrigger value="status">Status</TabsTrigger>
        <TabsTrigger value="capture">Captura</TabsTrigger>
        <TabsTrigger value="history">Histórico</TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="space-y-4">
        <form onSubmit={handleSubmit}>
          <DetailsForm
            clientId={clientId}
            selectedDate={selectedDate}
            services={services}
            editorialLines={editorialLines}
            products={products}
            clients={clients}
            isLoadingServices={isLoadingServices}
            isLoadingEditorialLines={isLoadingEditorialLines}
            isLoadingProducts={isLoadingProducts}
            isLoadingClients={isLoadingClients}
            formData={formData}
            onInputChange={onInputChange}
            onSelectChange={onSelectChange}
            onDateChange={onDateChange}
            prioritizeCaptureDate={prioritizeCaptureDate} // Passamos o parâmetro para o formulário de detalhes
          />
          
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 border rounded hover:bg-gray-100"
              onClick={onCancel}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="px-4 py-2 border rounded text-red-600 hover:bg-red-50"
              onClick={onDelete}
              disabled={!currentSelectedEvent || isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </TabsContent>

      <TabsContent value="status" className="space-y-4">
        <form onSubmit={handleStatusUpdate}>
          <StatusForm
            collaborators={collaborators}
            statuses={statuses}
            isLoadingCollaborators={isLoadingCollaborators}
            isLoadingStatuses={isLoadingStatuses}
            formData={formData}
            onInputChange={onInputChange}
            onSelectChange={onSelectChange}
          />
          
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 border rounded hover:bg-gray-100"
              onClick={onCancel}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Atualizando..." : "Atualizar Status"}
            </button>
          </div>
        </form>
      </TabsContent>

      <TabsContent value="capture" className="space-y-4">
        <form onSubmit={handleSubmit}>
          <CaptureForm
            captureDate={formData.capture_date}
            captureEndDate={formData.capture_end_date}
            isAllDay={formData.is_all_day !== null ? formData.is_all_day : true}
            location={formData.location}
            onCaptureChange={onDateTimeChange}
            onLocationChange={onInputChange}
            onAllDayChange={onAllDayChange}
          />
          
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 border rounded hover:bg-gray-100"
              onClick={onCancel}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </TabsContent>

      <TabsContent value="history" className="space-y-4">
        {currentSelectedEvent ? (
          <HistoryView scheduleId={currentSelectedEvent.id} />
        ) : (
          <p className="text-center text-gray-500 py-4">
            Histórico disponível apenas para eventos existentes.
          </p>
        )}
      </TabsContent>
    </Tabs>
  );
}
