
import { useState, useMemo } from "react";
import { ContentScheduleList } from "../ContentScheduleList";
import { ContentScheduleFilters } from "../ContentScheduleFilters";
import { CalendarEvent, OniAgenciaCollaborator } from "@/types/oni-agencia";
import { Loader2 } from "lucide-react";
import { DndContext } from "@dnd-kit/core";
import { useDndContext } from "../hooks/useDndContext";

interface ContentAreaProps {
  events: CalendarEvent[] | undefined;
  collaborators: OniAgenciaCollaborator[] | undefined;
  isLoading: boolean;
  onManualRefetch?: () => void;
}

export const ContentArea = ({ 
  events,
  collaborators,
  isLoading,
  onManualRefetch
}: ContentAreaProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusId, setSelectedStatusId] = useState<string | null>(null);
  const [selectedCollaboratorId, setSelectedCollaboratorId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const dndContext = useDndContext({ onEventUpdate: onManualRefetch });
  
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    
    return events.filter(event => {
      // Filter by search term
      const matchesSearch = 
        !searchTerm || 
        event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.collaborator?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by status
      const matchesStatus = !selectedStatusId || event.status_id === selectedStatusId;
      
      // Filter by collaborator
      const matchesCollaborator = !selectedCollaboratorId || event.collaborator_id === selectedCollaboratorId;
      
      // Filter by service
      const matchesService = !selectedServiceId || event.service_id === selectedServiceId;
      
      return matchesSearch && matchesStatus && matchesCollaborator && matchesService;
    });
  }, [events, searchTerm, selectedStatusId, selectedCollaboratorId, selectedServiceId]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatusId(value === "all" ? null : value);
  };

  const handleCollaboratorChange = (value: string) => {
    setSelectedCollaboratorId(value === "all" ? null : value);
  };

  const handleServiceChange = (value: string) => {
    setSelectedServiceId(value === "all" ? null : value);
  };

  return (
    <DndContext
      onDragStart={dndContext.handleDragStart}
      onDragEnd={dndContext.handleDragEnd}
    >
      <div className="space-y-4 p-4">
        <ContentScheduleFilters 
          selectedStatusId={selectedStatusId}
          onStatusChange={handleStatusChange}
          selectedCollaboratorId={selectedCollaboratorId}
          onCollaboratorChange={handleCollaboratorChange}
          selectedServiceId={selectedServiceId}
          onServiceChange={handleServiceChange}
          collaborators={collaborators ?? []}
          onSearchChange={handleSearchChange}
        />
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ContentScheduleList 
            events={filteredEvents} 
            onManualRefetch={onManualRefetch}
            clientId="feirinha-da-concordia"
          />
        )}
      </div>
    </DndContext>
  );
};
