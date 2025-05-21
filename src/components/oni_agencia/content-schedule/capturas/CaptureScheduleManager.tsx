
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CalendarEvent } from "@/types/oni-agencia";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CaptureForm } from "../schedule-dialog/CaptureForm";
import { useToast } from "@/hooks/use-toast";
import { formatDateToString, formatDateTimeToString } from "../hooks/utils/dateUtils";

interface CaptureScheduleManagerProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  selectedDate: Date | null;
  selectedCapture?: CalendarEvent | null;
  onCaptureCreated?: () => void;
}

export function CaptureScheduleManager({
  isOpen,
  onClose,
  clientId,
  selectedDate,
  selectedCapture,
  onCaptureCreated
}: CaptureScheduleManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form state
  const [captureDate, setCaptureDate] = useState<Date | null>(selectedDate || null);
  const [captureEndDate, setCaptureEndDate] = useState<Date | null>(null);
  const [isAllDay, setIsAllDay] = useState<boolean>(true);
  const [location, setLocation] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [collaboratorId, setCollaboratorId] = useState<string | null>(null);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [linkedSchedules, setLinkedSchedules] = useState<string[]>([]);
  
  // Reset form when dialog opens/closes or selected capture changes
  React.useEffect(() => {
    if (isOpen && selectedCapture) {
      // Populate form with selected capture data
      setCaptureDate(selectedCapture.capture_date ? new Date(selectedCapture.capture_date) : selectedDate);
      setCaptureEndDate(selectedCapture.capture_end_date ? new Date(selectedCapture.capture_end_date) : null);
      setIsAllDay(selectedCapture.is_all_day !== false);
      setLocation(selectedCapture.location || "");
      setDescription(selectedCapture.description || "");
      setCollaboratorId(selectedCapture.collaborator_id);
      setServiceId(selectedCapture.service_id);
      
      // Fetch linked schedules for this capture
      if (selectedCapture.id) {
        fetchLinkedSchedules(selectedCapture.id);
      }
    } else if (isOpen) {
      // Reset form for new capture
      setCaptureDate(selectedDate);
      setCaptureEndDate(null);
      setIsAllDay(true);
      setLocation("");
      setDescription("");
      setCollaboratorId(null);
      setServiceId(null);
      setLinkedSchedules([]);
    }
  }, [isOpen, selectedCapture, selectedDate]);
  
  // Fetch linked schedules
  const fetchLinkedSchedules = async (captureId: string) => {
    try {
      // In a real implementation, you would fetch schedules linked to this capture
      // For now we'll use the creators array as a placeholder for linked schedules
      setLinkedSchedules(selectedCapture?.creators || []);
    } catch (error) {
      console.error("Error fetching linked schedules:", error);
    }
  };
  
  // Create or update capture mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!clientId || !serviceId || !captureDate) {
        throw new Error("Dados obrigatórios não fornecidos");
      }
      
      const captureData = {
        client_id: clientId,
        service_id: serviceId,
        collaborator_id: collaboratorId,
        title: "Captura: " + location || new Date(captureDate).toLocaleDateString(),
        description: description,
        scheduled_date: captureDate ? formatDateToString(captureDate) : undefined,
        capture_date: captureDate ? (isAllDay ? formatDateToString(captureDate) : formatDateTimeToString(captureDate)) : undefined,
        capture_end_date: captureEndDate ? (isAllDay ? formatDateToString(captureEndDate) : formatDateTimeToString(captureEndDate)) : undefined,
        is_all_day: isAllDay,
        location: location,
        creators: linkedSchedules.length > 0 ? linkedSchedules : null,
        status_id: "5dafbb94-c11e-4581-8634-167c8f002sins" // Assuming this is a valid status ID for "Liberado para Captura"
      };
      
      if (selectedCapture?.id) {
        // Update existing capture
        const { data, error } = await supabase
          .from("oni_agencia_content_schedules")
          .update(captureData)
          .eq("id", selectedCapture.id)
          .select();
          
        if (error) throw error;
        return data;
      } else {
        // Create new capture
        const { data, error } = await supabase
          .from("oni_agencia_content_schedules")
          .insert(captureData)
          .select();
          
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
      if (onCaptureCreated) onCaptureCreated();
      toast({
        title: selectedCapture ? "Captura atualizada" : "Captura criada",
        description: "Dados salvos com sucesso",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: `Não foi possível salvar a captura: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      });
    }
  });

  // Delete capture mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCapture?.id) throw new Error("ID da captura não fornecido");
      
      const { error } = await supabase
        .from("oni_agencia_content_schedules")
        .delete()
        .eq("id", selectedCapture.id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
      toast({
        title: "Captura excluída",
        description: "A captura foi excluída com sucesso",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: `Não foi possível excluir a captura: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      });
    }
  });

  const handleSave = () => {
    if (!clientId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Selecione um cliente antes de salvar",
      });
      return;
    }
    
    if (!captureDate) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "A data de captura é obrigatória",
      });
      return;
    }
    
    if (!serviceId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Selecione um serviço antes de salvar",
      });
      return;
    }
    
    saveMutation.mutate();
  };

  const handleDelete = () => {
    if (window.confirm("Tem certeza que deseja excluir esta captura?")) {
      deleteMutation.mutate();
    }
  };

  const handleDateChange = (name: string, value: Date | null) => {
    if (name === "capture_date") {
      setCaptureDate(value);
    } else if (name === "capture_end_date") {
      setCaptureEndDate(value);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {selectedCapture ? "Editar Captura" : "Nova Captura"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <CaptureForm
            clientId={clientId}
            captureDate={captureDate}
            captureEndDate={captureEndDate}
            isAllDay={isAllDay}
            location={location}
            collaboratorId={collaboratorId}
            serviceId={serviceId}
            description={description}
            linkedSchedules={linkedSchedules}
            onDateChange={handleDateChange}
            onLocationChange={(e) => setLocation(e.target.value)}
            onDescriptionChange={(e) => setDescription(e.target.value)}
            onCollaboratorChange={setCollaboratorId}
            onServiceChange={setServiceId}
            onAllDayChange={setIsAllDay}
            onLinkedSchedulesChange={setLinkedSchedules}
          />
        </div>
        
        <div className="flex justify-between">
          <div>
            {selectedCapture && (
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Excluindo..." : "Excluir Captura"}
              </Button>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? "Salvando..." : "Salvar Captura"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
