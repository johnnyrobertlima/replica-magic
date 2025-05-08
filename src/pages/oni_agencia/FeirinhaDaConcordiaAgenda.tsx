import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { ContentCalendar } from "@/components/oni_agencia/content-schedule/ContentCalendar";
import { ContentArea } from "@/components/oni_agencia/content-schedule/control-pauta/ContentArea";
import { OniAgenciaService, OniAgenciaCollaborator, CalendarEvent } from "@/types/oni-agencia";
import { getServices } from "@/services/oniAgenciaServices";
import { getCollaborators } from "@/services/oniAgenciaCollaboratorServices";
import { getCalendarEvents } from "@/services/oniAgenciaCalendarEventServices";
import { Separator } from "@/components/ui/separator";
import { ClientAreaHeader } from "@/components/oni_agencia/shared/ClientAreaHeader";
import { Select } from "@/components/ui/select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const clientId = "feirinha-da-concordia";

export default function FeirinhaDaConcordiaAgenda() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMonth = searchParams.get("month");
  const initialYear = searchParams.get("year");
  const initialCollaborator = searchParams.get("collaborator");

  const [month, setMonth] = useState(initialMonth ? parseInt(initialMonth) : new Date().getMonth() + 1);
  const [year, setYear] = useState(initialYear ? parseInt(initialYear) : new Date().getFullYear());
  const [selectedCollaborator, setSelectedCollaborator] = useState<string | null>(initialCollaborator || null);
  
  const { 
    data: events, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ["calendarEvents", clientId, month, year],
    queryFn: () => getCalendarEvents(clientId, month, year),
  });
  
  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ["oniAgenciaServices"],
    queryFn: getServices,
  });
  
  const { data: collaborators, isLoading: isLoadingCollaborators } = useQuery({
    queryKey: ["oniAgenciaCollaborators"],
    queryFn: getCollaborators,
  });

  useEffect(() => {
    // Update URL when month or year changes
    setSearchParams({
      month: month.toString(),
      year: year.toString(),
      collaborator: selectedCollaborator || '',
    });
  }, [month, year, selectedCollaborator, setSearchParams]);

  const handleMonthYearChange = (month: number, year: number) => {
    setMonth(month);
    setYear(year);
  };

  const handleCollaboratorChange = (collaboratorId: string) => {
    setSelectedCollaborator(collaboratorId === "all" ? null : collaboratorId);
  };

  const filteredEvents = events ? events.filter(event => event.client_id === clientId) : [];

  const currentDate = new Date(year, month - 1, 1);
  const formattedDate = format(currentDate, 'MMMM yyyy', { locale: ptBR });

  return (
    <div className="container relative pt-6">
      <ClientAreaHeader 
        title="Feirinha da Concórdia" 
        description={`Acompanhe a agenda de conteúdo da Feirinha da Concórdia - ${formattedDate}`} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <ContentCalendar
            events={filteredEvents}
            clientId={clientId}
            month={month}
            year={year}
            onMonthYearChange={handleMonthYearChange}
            selectedCollaborator={selectedCollaborator}
            onManualRefetch={refetch}
          />
        </div>

        <div>
          <div className="bg-white rounded-md border shadow-sm p-4">
            <Label htmlFor="collaborator">Filtrar por Colaborador</Label>
            <Select value={selectedCollaborator || "all"} onValueChange={handleCollaboratorChange}>
              <SelectTrigger id="collaborator" className="w-full">
                <SelectValue placeholder="Todos os Colaboradores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Colaboradores</SelectItem>
                {collaborators?.map((collaborator) => (
                  <SelectItem key={collaborator.id} value={collaborator.id}>
                    {collaborator.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Controle de Pauta</h2>
        <Button onClick={() => navigate('/client-area/feirinha-da-concordia/controle-de-pauta/novo')}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Pauta
        </Button>
      </div>

      <ContentArea 
        events={events}
        collaborators={collaborators}
        isLoading={isLoading}
        onManualRefetch={refetch}
      />
    </div>
  );
}
