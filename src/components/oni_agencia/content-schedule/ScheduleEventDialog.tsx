
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarEvent, ContentScheduleFormData, OniAgenciaService, OniAgenciaCollaborator } from "@/types/oni-agencia";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  useServices,
  useCollaborators,
  useCreateContentSchedule,
  useUpdateContentSchedule,
  useDeleteContentSchedule
} from "@/hooks/useOniAgenciaContentSchedules";
import { Loader2, Trash2 } from "lucide-react";

interface ScheduleEventDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  selectedDate: Date;
  events: CalendarEvent[];
  onClose: () => void;
}

export function ScheduleEventDialog({
  isOpen,
  onOpenChange,
  clientId,
  selectedDate,
  events,
  onClose
}: ScheduleEventDialogProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [formData, setFormData] = useState<ContentScheduleFormData>({
    client_id: clientId,
    service_id: "",
    collaborator_id: null,
    title: "",
    description: null,
    scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
    execution_phase: null
  });

  const { data: services = [], isLoading: isLoadingServices } = useServices();
  const { data: collaborators = [], isLoading: isLoadingCollaborators } = useCollaborators();
  
  const createMutation = useCreateContentSchedule();
  const updateMutation = useUpdateContentSchedule();
  const deleteMutation = useDeleteContentSchedule();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  // If there's just one event on this day, auto-select it for editing
  useEffect(() => {
    if (events.length === 1) {
      handleSelectEvent(events[0]);
    } else {
      resetForm();
    }
  }, [events]);

  const resetForm = () => {
    setSelectedEvent(null);
    setFormData({
      client_id: clientId,
      service_id: "",
      collaborator_id: null,
      title: "",
      description: null,
      scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
      execution_phase: null
    });
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setFormData({
      client_id: event.client_id,
      service_id: event.service_id,
      collaborator_id: event.collaborator_id,
      title: event.title,
      description: event.description,
      scheduled_date: event.scheduled_date,
      execution_phase: event.execution_phase
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value || null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedEvent) {
      await updateMutation.mutateAsync({
        id: selectedEvent.id,
        schedule: formData
      });
    } else {
      await createMutation.mutateAsync(formData);
    }
    
    onOpenChange(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    
    if (confirm("Tem certeza que deseja excluir este agendamento?")) {
      await deleteMutation.mutateAsync({
        id: selectedEvent.id,
        clientId,
        year: selectedDate.getFullYear(),
        month: selectedDate.getMonth() + 1
      });
      
      onOpenChange(false);
      onClose();
    }
  };

  const getServiceColor = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.color : "#9b87f5";
  };

  const getExecutionPhaseOptions = () => [
    { value: "planning", label: "Planejamento" },
    { value: "creation", label: "Criação" },
    { value: "review", label: "Revisão" },
    { value: "approval", label: "Aprovação" },
    { value: "scheduled", label: "Agendado" },
    { value: "published", label: "Publicado" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) onClose();
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {selectedEvent ? "Editar Agendamento" : "Novo Agendamento"}
            <div className="text-sm font-normal text-muted-foreground mt-1">
              {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </div>
          </DialogTitle>
        </DialogHeader>

        {events.length > 1 && !selectedEvent && (
          <div className="mb-4">
            <Label>Selecionar agendamento existente</Label>
            <div className="grid gap-2 mt-2">
              {events.map(event => (
                <Button
                  key={event.id}
                  variant="outline"
                  className="justify-start h-auto py-2 px-3 text-left"
                  style={{ borderLeftColor: event.service.color, borderLeftWidth: '4px' }}
                  onClick={() => handleSelectEvent(event)}
                >
                  <div>
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-muted-foreground">{event.service.name}</div>
                  </div>
                </Button>
              ))}
            </div>
            <div className="flex justify-center mt-4">
              <Button variant="outline" onClick={resetForm}>Criar Novo</Button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="service_id">Serviço</Label>
              <Select
                value={formData.service_id}
                onValueChange={(value) => handleSelectChange("service_id", value)}
                required
              >
                <SelectTrigger 
                  id="service_id"
                  className="w-full"
                  style={formData.service_id ? { borderLeftColor: getServiceColor(formData.service_id), borderLeftWidth: '4px' } : {}}
                >
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingServices ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2">Carregando...</span>
                    </div>
                  ) : (
                    services.map((service) => (
                      <SelectItem 
                        key={service.id} 
                        value={service.id}
                        className="flex items-center"
                      >
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: service.color }}
                          ></div>
                          {service.name}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="collaborator_id">Colaborador Responsável</Label>
              <Select
                value={formData.collaborator_id || ""}
                onValueChange={(value) => handleSelectChange("collaborator_id", value)}
              >
                <SelectTrigger id="collaborator_id" className="w-full">
                  <SelectValue placeholder="Selecione um colaborador" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingCollaborators ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2">Carregando...</span>
                    </div>
                  ) : (
                    collaborators.map((collaborator) => (
                      <SelectItem key={collaborator.id} value={collaborator.id}>
                        {collaborator.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="execution_phase">Fase de Execução</Label>
              <Select
                value={formData.execution_phase || ""}
                onValueChange={(value) => handleSelectChange("execution_phase", value)}
              >
                <SelectTrigger id="execution_phase" className="w-full">
                  <SelectValue placeholder="Selecione a fase" />
                </SelectTrigger>
                <SelectContent>
                  {getExecutionPhaseOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="flex items-center justify-between pt-2">
            {selectedEvent && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={handleDelete}
                disabled={isDeleting || isSubmitting}
                className="mr-auto"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            )}
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  onClose();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  selectedEvent ? "Atualizar" : "Criar"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
