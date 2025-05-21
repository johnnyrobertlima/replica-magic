
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDatePicker } from "@/components/ui/calendar-date-picker";
import { DateTimePicker } from "./DateTimePicker";
import { SelectCollaborator } from "./SelectCollaborator";
import { SelectService } from "./SelectService";
import { Button } from "@/components/ui/button";
import { PlusCircle, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CalendarEvent } from "@/types/oni-agencia";
import { Badge } from "@/components/ui/badge";

interface CaptureFormProps {
  clientId: string;
  captureDate: Date | null;
  captureEndDate: Date | null;
  isAllDay: boolean;
  location: string | null;
  collaboratorId: string | null;
  serviceId: string | null;
  description: string | null;
  linkedSchedules: string[] | null;
  onDateChange: (name: string, value: Date | null) => void;
  onLocationChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onDescriptionChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onCollaboratorChange: (value: string) => void;
  onServiceChange: (value: string) => void;
  onAllDayChange: (value: boolean) => void;
  onLinkedSchedulesChange: (scheduleIds: string[]) => void;
}

export function CaptureForm({
  clientId,
  captureDate,
  captureEndDate,
  isAllDay,
  location,
  collaboratorId,
  serviceId,
  description,
  linkedSchedules = [],
  onDateChange,
  onLocationChange,
  onDescriptionChange,
  onCollaboratorChange,
  onServiceChange,
  onAllDayChange,
  onLinkedSchedulesChange
}: CaptureFormProps) {
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  
  // Fetch available schedules for the client
  const { data: availableSchedules = [], isLoading: isLoadingSchedules } = useQuery({
    queryKey: ['available-schedules', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oni_agencia_content_schedules")
        .select(`
          id,
          title,
          scheduled_date,
          service:service_id(id, name, category, color)
        `)
        .eq("client_id", clientId)
        // Filter out already linked schedules
        .not("id", "in", linkedSchedules?.filter(id => id) || []);
        
      if (error) {
        console.error("Error fetching available schedules:", error);
        throw error;
      }
      
      return data;
    },
    enabled: !!clientId
  });

  // Fetch details of already linked schedules
  const { data: linkedScheduleDetails = [], isLoading: isLoadingLinked } = useQuery({
    queryKey: ['linked-schedules', linkedSchedules],
    queryFn: async () => {
      if (!linkedSchedules?.length) return [];
      
      const { data, error } = await supabase
        .from("oni_agencia_content_schedules")
        .select(`
          id,
          title,
          scheduled_date,
          service:service_id(id, name, category, color)
        `)
        .in("id", linkedSchedules);
        
      if (error) {
        console.error("Error fetching linked schedules:", error);
        throw error;
      }
      
      return data;
    },
    enabled: !!(linkedSchedules && linkedSchedules.length > 0)
  });

  // Add a schedule to linked schedules
  const handleAddSchedule = () => {
    if (selectedScheduleId && !linkedSchedules?.includes(selectedScheduleId)) {
      const updatedSchedules = [...(linkedSchedules || []), selectedScheduleId];
      onLinkedSchedulesChange(updatedSchedules);
      setSelectedScheduleId(null);
    }
  };

  // Remove a schedule from linked schedules
  const handleRemoveSchedule = (scheduleId: string) => {
    const updatedSchedules = linkedSchedules?.filter(id => id !== scheduleId) || [];
    onLinkedSchedulesChange(updatedSchedules);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="is_all_day">Todo o dia</Label>
        <div className="flex items-center space-x-2">
          <Switch
            id="is_all_day"
            checked={isAllDay}
            onCheckedChange={onAllDayChange}
          />
          <Label htmlFor="is_all_day" className="cursor-pointer">
            {isAllDay ? "Sim" : "Não"}
          </Label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="capture_date" className="flex items-center">
            Data de Captura* 
            {!captureDate && (
              <span className="text-red-500 ml-1 text-sm">Campo obrigatório</span>
            )}
          </Label>
          {isAllDay ? (
            <CalendarDatePicker
              value={captureDate}
              onChange={(date) => onDateChange("capture_date", date)}
              placeholder="Selecione uma data"
              className={!captureDate ? "border-red-300" : ""}
            />
          ) : (
            <DateTimePicker 
              label="Data de início"
              date={captureDate}
              onDateChange={(date) => onDateChange("capture_date", date)}
              showTimePicker={true}
              className={!captureDate ? "border-red-300" : ""}
            />
          )}
        </div>

        {!isAllDay && (
          <div>
            <Label htmlFor="capture_end_date">Data de Término</Label>
            <DateTimePicker 
              label="Data de término"
              date={captureEndDate}
              onDateChange={(date) => onDateChange("capture_end_date", date)}
              showTimePicker={true}
            />
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="location">Local</Label>
        <Input
          id="location"
          name="location"
          value={location || ""}
          onChange={onLocationChange}
          placeholder="Local da captura"
        />
      </div>

      <div>
        <SelectCollaborator 
          clientId={clientId}
          value={collaboratorId || ""}
          onChange={onCollaboratorChange}
        />
      </div>

      <div>
        <SelectService
          clientId={clientId}
          value={serviceId || ""}
          onChange={onServiceChange}
        />
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          value={description || ""}
          onChange={onDescriptionChange}
          placeholder="Descrição da captura"
          className="h-24"
        />
      </div>
      
      <div className="space-y-3">
        <Label>Agendamentos Vinculados</Label>
        
        {/* Display linked schedules */}
        <div className="space-y-2">
          {isLoadingLinked ? (
            <div className="text-sm text-muted-foreground">Carregando agendamentos vinculados...</div>
          ) : linkedScheduleDetails.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {linkedScheduleDetails.map(schedule => (
                <Badge 
                  key={schedule.id} 
                  className="px-2 py-1 flex items-center gap-1"
                  style={{ backgroundColor: schedule.service?.color || '#666' }}
                >
                  <span>{schedule.title}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSchedule(schedule.id)}
                    className="ml-1 rounded-full p-1 hover:bg-white/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Nenhum agendamento vinculado</div>
          )}
        </div>
        
        {/* Select to add more schedules */}
        <div className="flex items-center gap-2">
          <select 
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            value={selectedScheduleId || ""}
            onChange={(e) => setSelectedScheduleId(e.target.value || null)}
          >
            <option value="">Selecione um agendamento</option>
            {isLoadingSchedules ? (
              <option disabled>Carregando...</option>
            ) : (
              availableSchedules.map(schedule => (
                <option key={schedule.id} value={schedule.id}>
                  {schedule.title} ({schedule.service?.name})
                </option>
              ))
            )}
          </select>
          <Button 
            type="button" 
            variant="outline" 
            size="icon" 
            onClick={handleAddSchedule}
            disabled={!selectedScheduleId}
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
