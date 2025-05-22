
import React, { useState } from "react";
import { EventForm } from "./EventForm";
import { StatusUpdateForm } from "./StatusUpdateForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarEvent, ContentScheduleFormData } from "@/types/oni-agencia";
import { useHistoryTab } from "../hooks/useHistoryTab";
import { HistoryTimeline, HistoryEntry } from "./HistoryTimeline";
import { CaptureForm } from "./CaptureForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
  onSubmit: (e: React.FormEvent) => Promise<void> | void;
  onStatusUpdate: (e: React.FormEvent) => Promise<void> | void;
  onDelete: () => Promise<void> | void;
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
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const {
    historyData,
    isLoadingHistory,
    isHistoryError
  } = useHistoryTab(currentSelectedEvent?.id, !!currentSelectedEvent);
  
  const queryClient = useQueryClient();
  
  const handleRefetchResources = () => {
    console.log("Refetching resources from DialogContent");
    queryClient.invalidateQueries({
      queryKey: ['oniAgenciaCollaborators']
    });
    queryClient.invalidateQueries({
      queryKey: ['oniAgenciaStatuses']
    });
    queryClient.invalidateQueries({
      queryKey: ['oniAgenciaThemes']
    });
    queryClient.invalidateQueries({
      queryKey: ['oniAgenciaServices']
    });
  };

  // Função para validar o formulário antes do envio
  const validateSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = [];
    
    // Verifica campos obrigatórios com base na aba ativa
    if (activeTab === "details" || activeTab === "capture") {
      // Cliente é sempre obrigatório
      if (!formData.client_id) {
        errors.push("Cliente é obrigatório");
      }
      
      // Título é sempre obrigatório
      if (!formData.title) {
        errors.push("Título é obrigatório");
      }
      
      // Serviço é sempre obrigatório
      if (!formData.service_id) {
        errors.push("Serviço é obrigatório");
      }
      
      // Data de agendamento ou captura é obrigatória
      if (activeTab === "details" && !formData.scheduled_date) {
        errors.push("Data de agendamento é obrigatória");
      } else if (activeTab === "capture" && !formData.capture_date) {
        errors.push("Data de captura é obrigatória");
      }
    } else if (activeTab === "status") {
      // Status é obrigatório na aba de status
      if (!formData.status_id) {
        errors.push("Status é obrigatório");
      }
    }
    
    // Se houver erros, exiba-os e não envie o formulário
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    // Limpa erros de validação e envia o formulário
    setValidationErrors([]);
    
    // Chama a função apropriada com base na aba ativa
    if (activeTab === "status") {
      console.log("Submitting status update with data:", {
        status_id: formData.status_id,
        collaborator_id: formData.collaborator_id,
        description: formData.description
      });
      onStatusUpdate(e);
    } else {
      onSubmit(e);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Limpa erros de validação ao trocar de aba
    setValidationErrors([]);
  };

  // Log form data for debugging
  console.log("FormData in DialogContent:", formData);

  return <>
      <Tabs defaultValue={defaultTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="status" disabled={!currentSelectedEvent}>Status</TabsTrigger>
          <TabsTrigger value="history" disabled={!currentSelectedEvent}>Histórico</TabsTrigger>
          <TabsTrigger value="capture">Captura</TabsTrigger>
        </TabsList>
        
        {validationErrors.length > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc pl-5">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        <ScrollArea className="h-[60vh]">
          <form onSubmit={validateSubmitForm}>
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
              <div className="flex justify-end space-x-2 mt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {currentSelectedEvent ? "Atualizar" : "Criar"}
                </Button>
                {currentSelectedEvent && (
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    disabled={isDeleting}
                  >
                    Excluir
                  </Button>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="status">
              <StatusUpdateForm 
                statuses={statuses}
                collaborators={collaborators}
                value={formData.status_id || ''}
                collaboratorId={formData.collaborator_id}
                description={formData.description || ''}
                isLoading={isLoadingStatuses}
                isLoadingCollaborators={isLoadingCollaborators}
                isSubmitting={isSubmitting}
                onSubmit={validateSubmitForm}
                onValueChange={(value) => onSelectChange('status_id', value)}
                onCollaboratorChange={(value) => onSelectChange('collaborator_id', value)}
                onInputChange={onInputChange}
                onCancel={onCancel}
              />
            </TabsContent>
            
            <TabsContent value="history">
              <div className="h-[60vh]">
                <HistoryTimeline 
                  historyData={historyData} 
                  isLoading={isLoadingHistory} 
                  isError={isHistoryError}
                  onRefetchResources={handleRefetchResources}
                />
              </div>
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
              <div className="flex justify-end space-x-2 mt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {currentSelectedEvent ? "Atualizar" : "Criar"}
                </Button>
                {currentSelectedEvent && (
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    disabled={isDeleting}
                  >
                    Excluir
                  </Button>
                )}
              </div>
            </TabsContent>
          </form>
        </ScrollArea>
      </Tabs>
      
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente este agendamento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                onDelete();
                setIsDeleteConfirmOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>;
}
