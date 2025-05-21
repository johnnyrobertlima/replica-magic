
import { ContentScheduleFormData, OniAgenciaService, OniAgenciaCollaborator, OniAgenciaClient } from "@/types/oni-agencia";
import { DialogFooter } from "@/components/ui/dialog";
import { EventForm } from "./EventForm";
import { DialogActions } from "./DialogActions";
import { EditorialLine, Product, Status } from "@/pages/admin/sub-themes/types";
import { CaptureForm } from "./CaptureForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera } from "lucide-react";
import { useLocation } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NewEventFormProps {
  formData: ContentScheduleFormData;
  services: OniAgenciaService[];
  collaborators: OniAgenciaCollaborator[];
  editorialLines: EditorialLine[];
  products: Product[];
  statuses: Status[];
  clients: OniAgenciaClient[];
  isLoadingServices: boolean;
  isLoadingCollaborators: boolean;
  isLoadingEditorialLines: boolean;
  isLoadingProducts: boolean;
  isLoadingStatuses: boolean;
  isLoadingClients: boolean;
  isSubmitting: boolean;
  isDeleting: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onDateChange: (name: string, value: Date | null) => void;
  onDateTimeChange?: (name: string, value: Date | null) => void;
  onAllDayChange?: (value: boolean) => void;
  defaultTab?: "details" | "status" | "history" | "capture";
}

export function NewEventForm({
  formData,
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
  onSubmit,
  onCancel,
  onInputChange,
  onSelectChange,
  onDateChange,
  onDateTimeChange,
  onAllDayChange,
  defaultTab = "details"
}: NewEventFormProps) {
  const location = useLocation();
  const isCapturesRoute = location.pathname.includes('/capturas');
  const activeTab = isCapturesRoute ? "capture" : defaultTab;

  return (
    <form onSubmit={onSubmit}>
      <ScrollArea className="max-h-[80vh]">
        {isCapturesRoute ? (
          <>
            <CaptureForm 
              captureDate={formData.capture_date}
              captureEndDate={formData.capture_end_date}
              isAllDay={formData.is_all_day === true}
              location={formData.location}
              onDateChange={onDateChange}
              onLocationChange={onInputChange}
              onAllDayChange={onAllDayChange || (() => {})}
            />
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2 text-blue-700 font-semibold">
                <span>Dados do Agendamento</span>
              </div>
              <EventForm
                formData={formData}
                services={services}
                collaborators={collaborators}
                editorialLines={editorialLines}
                products={products}
                statuses={statuses}
                clients={clients}
                isLoadingServices={isLoadingServices}
                isLoadingCollaborators={isLoadingCollaborators}
                isLoadingEditorialLines={isLoadingEditorialLines}
                isLoadingProducts={isLoadingProducts}
                isLoadingStatuses={isLoadingStatuses}
                isLoadingClients={isLoadingClients}
                onInputChange={onInputChange}
                onSelectChange={onSelectChange}
                onDateChange={onDateChange}
                prioritizeCaptureDate={isCapturesRoute}
              />
            </div>
          </>
        ) : (
          <Tabs value={activeTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="capture" className="flex items-center gap-2">
                <Camera size={16} />
                Captura
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <EventForm
                formData={formData}
                services={services}
                collaborators={collaborators}
                editorialLines={editorialLines}
                products={products}
                statuses={statuses}
                clients={clients}
                isLoadingServices={isLoadingServices}
                isLoadingCollaborators={isLoadingCollaborators}
                isLoadingEditorialLines={isLoadingEditorialLines}
                isLoadingProducts={isLoadingProducts}
                isLoadingStatuses={isLoadingStatuses}
                isLoadingClients={isLoadingClients}
                onInputChange={onInputChange}
                onSelectChange={onSelectChange}
                onDateChange={onDateChange}
              />
            </TabsContent>
            
            <TabsContent value="capture">
              <CaptureForm 
                captureDate={formData.capture_date}
                captureEndDate={formData.capture_end_date}
                isAllDay={formData.is_all_day === true}
                location={formData.location}
                onDateChange={onDateChange}
                onLocationChange={onInputChange}
                onAllDayChange={onAllDayChange || (() => {})}
              />
            </TabsContent>
          </Tabs>
        )}
      </ScrollArea>
      
      <DialogFooter>
        <DialogActions
          isSubmitting={isSubmitting}
          isDeleting={isDeleting}
          onCancel={onCancel}
          isEditing={false}
        />
      </DialogFooter>
    </form>
  );
}
