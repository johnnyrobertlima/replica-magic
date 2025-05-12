
import React, { useState } from "react";
import { EventForm } from "./EventForm";
import { StatusUpdateForm } from "./StatusUpdateForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarEvent, ContentScheduleFormData } from "@/types/oni-agencia";
import { useHistoryTab } from "../hooks/useHistoryTab";
import { HistoryTimeline } from "./HistoryTimeline";
import { CaptureForm } from "./CaptureForm";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";

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
  defaultTab?: "details" | "status" | "history" | "capture";
  prioritizeCaptureDate?: boolean;
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
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  
  const { historyData, isLoadingHistory, isHistoryError } = useHistoryTab(
    currentSelectedEvent?.id,
    !!currentSelectedEvent
  );
  
  const queryClient = useQueryClient();
  
  const handleRefetchResources = () => {
    console.log("Refetching resources from DialogContent");
    queryClient.invalidateQueries({ queryKey: ['oniAgenciaCollaborators'] });
    queryClient.invalidateQueries({ queryKey: ['oniAgenciaStatuses'] });
    queryClient.invalidateQueries({ queryKey: ['oniAgenciaThemes'] });
    queryClient.invalidateQueries({ queryKey: ['oniAgenciaServices'] });
  };

  return (
    <>
      <Tabs 
        defaultValue={defaultTab} 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="status" disabled={!currentSelectedEvent}>Status</TabsTrigger>
          <TabsTrigger value="history" disabled={!currentSelectedEvent}>Histórico</TabsTrigger>
          <TabsTrigger value="capture">Captura</TabsTrigger>
        </TabsList>
        
        <ScrollArea className="h-[60vh]">
          <form onSubmit={activeTab === "status" ? onStatusUpdate : onSubmit} className="p-2">
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
            
            <TabsContent value="status">
              {currentSelectedEvent && (
                <StatusUpdateForm
                  event={currentSelectedEvent}
                  statuses={statuses}
                  collaborators={collaborators}
                  isLoadingStatuses={isLoadingStatuses}
                  isLoadingCollaborators={isLoadingCollaborators}
                  selectedStatus={formData.status_id || ""}
                  selectedCollaborator={formData.collaborator_id || ""}
                  note={formData.description || ""}
                  isSubmitting={isSubmitting}
                  onStatusChange={(value) => onSelectChange("status_id", value)}
                  onCollaboratorChange={(value) => onSelectChange("collaborator_id", value)}
                  onNoteChange={(value) => onInputChange({ target: { name: "description", value } } as React.ChangeEvent<HTMLTextAreaElement>)}
                  onRetryLoadResources={handleRefetchResources}
                />
              )}
            </TabsContent>
            
            <TabsContent value="history">
              <HistoryTimeline
                historyData={historyData}
                isLoading={isLoadingHistory}
                isError={isHistoryError}
              />
            </TabsContent>
            
            <TabsContent value="capture">
              <CaptureForm
                captureDate={formData.capture_date}
                captureEndDate={formData.capture_end_date}
                isAllDay={formData.is_all_day === true}
                location={formData.location}
                onCaptureChange={onDateTimeChange}
                onLocationChange={onInputChange}
                onAllDayChange={onAllDayChange}
              />
            </TabsContent>
            
            <div className="flex justify-end gap-2 mt-8">
              {currentSelectedEvent && activeTab !== "history" && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  disabled={isSubmitting || isDeleting}
                >
                  Excluir
                </Button>
              )}
              
              <div className="flex-1"></div>
              
              <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting || isDeleting}>
                Cancelar
              </Button>
              
              {activeTab !== "history" && (
                <Button 
                  type="submit" 
                  disabled={isSubmitting || isDeleting || 
                    (activeTab === "status" && (!formData.status_id || formData.status_id === "null"))}
                >
                  {activeTab === "status" ? "Atualizar Status" : currentSelectedEvent ? "Salvar" : "Criar"}
                </Button>
              )}
            </div>
          </form>
        </ScrollArea>
      </Tabs>

      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O agendamento será permanentemente excluído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} disabled={isDeleting}>
              {isDeleting ? "Excluindo..." : "Sim, excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
