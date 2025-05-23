
import React, { useState, useEffect } from "react";
import { Tabs } from "@/components/ui/tabs";
import { CalendarEvent, ContentScheduleFormData } from "@/types/oni-agencia";
import { useHistoryTab } from "../hooks/useHistoryTab";
import { useQueryClient } from "@tanstack/react-query";
import { TabNavigation } from "./TabNavigation";
import { ValidationErrors } from "./ValidationErrors";
import { TabContentWrapper } from "./TabContentWrapper";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

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
  const [activeTab, setActiveTab] = useState<string>(defaultTab || "details");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Update activeTab whenever defaultTab changes
  useEffect(() => {
    if (defaultTab && currentSelectedEvent) {
      console.log("Setting active tab to:", defaultTab);
      setActiveTab(defaultTab);
    }
  }, [defaultTab, currentSelectedEvent]);
  
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

  // Function to validate form before submission
  const validateSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = [];
    
    // Basic validation - client, title and service are always required
    if (!formData.client_id) {
      errors.push("Cliente é obrigatório");
    }
    
    if (!formData.title) {
      errors.push("Título é obrigatório");
    }
    
    if (!formData.service_id) {
      errors.push("Serviço é obrigatório");
    }
    
    // At least one date is required (scheduled_date or capture_date)
    if (!formData.scheduled_date && !formData.capture_date) {
      errors.push("É necessário informar pelo menos uma data (Agendamento ou Captura)");
    }
    
    // If there are errors, show them and don't submit the form
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    // Clear validation errors and submit the form
    setValidationErrors([]);
    
    console.log("Unified submission - saving all form data:", formData);
    
    // Always use onSubmit (complete update) instead of onStatusUpdate (partial update)
    onSubmit(e);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Clear validation errors when changing tabs
    setValidationErrors([]);
  };

  // Log form data for debugging
  console.log("FormData in DialogContent:", formData);

  return (
    <>
      <Tabs defaultValue={defaultTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabNavigation 
          activeTab={activeTab}
          currentSelectedEvent={currentSelectedEvent}
          onTabChange={handleTabChange}
        />
        
        <ValidationErrors errors={validationErrors} />
        
        <form onSubmit={validateSubmitForm}>
          <TabContentWrapper
            activeTab={activeTab}
            currentSelectedEvent={currentSelectedEvent}
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
            isSubmitting={isSubmitting}
            isDeleting={isDeleting}
            historyData={historyData}
            isLoadingHistory={isLoadingHistory}
            isHistoryError={isHistoryError}
            onSubmit={validateSubmitForm}
            onCancel={onCancel}
            onInputChange={onInputChange}
            onSelectChange={onSelectChange}
            onDateChange={onDateChange}
            onAllDayChange={onAllDayChange}
            onRefetchResources={handleRefetchResources}
          />
        </form>
      </Tabs>
      
      <DeleteConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={onDelete}
      />
    </>
  );
}
