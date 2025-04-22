import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { CalendarEvent, ContentScheduleFormData } from "@/types/oni-agencia";

export function useScheduleFormState({
  clientId,
  selectedDate,
  selectedEvent
}: {
  clientId: string;
  selectedDate: Date;
  selectedEvent?: CalendarEvent;
}) {
  const [currentSelectedEvent, setCurrentSelectedEvent] = useState<CalendarEvent | null>(selectedEvent || null);
  const [formData, setFormData] = useState<{
    // Permitir creators como string[] | null
    client_id: string;
    service_id: string;
    collaborator_id: string | null;
    creators: string[] | null;
    title: string;
    description: string | null;
    scheduled_date: string;
    execution_phase: string | null;
    editorial_line_id: string | null;
    product_id: string | null;
    status_id: string | null;
  }>({
    client_id: clientId,
    service_id: "",
    collaborator_id: null,
    creators: [],
    title: "",
    description: null,
    scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
    execution_phase: null,
    editorial_line_id: null,
    product_id: null,
    status_id: null
  });
  
  const isUserEditing = useRef(false);

  useEffect(() => {
    if (selectedEvent && !isUserEditing.current) {
      handleSelectEvent(selectedEvent);
    }
  }, [selectedEvent]);

  const resetForm = () => {
    setCurrentSelectedEvent(null);
    setFormData({
      client_id: clientId,
      service_id: "",
      collaborator_id: null,
      creators: [],
      title: "",
      description: null,
      scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
      execution_phase: null,
      editorial_line_id: null,
      product_id: null,
      status_id: null
    });
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setCurrentSelectedEvent(event);
    setFormData({
      client_id: event.client_id,
      service_id: event.service_id || "",
      collaborator_id: event.collaborator_id,
      creators: event.creators || [],
      title: event.title || "",
      description: event.description,
      scheduled_date: event.scheduled_date,
      execution_phase: event.execution_phase,
      editorial_line_id: event.editorial_line_id,
      product_id: event.product_id,
      status_id: event.status_id
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    isUserEditing.current = true;
    setFormData(prev => ({ ...prev, [name]: value || (name === "title" ? "" : null) }));
    setTimeout(() => { isUserEditing.current = false; }, 100);
  };

  // Multi-select awareness
  const handleSelectChange = (name: string, value: string | string[]) => {
    isUserEditing.current = true;

    // nova lógica para creators
    if (name === "creators") {
      setFormData(prev => ({ ...prev, creators: Array.isArray(value) ? value : [] }));
    } else {
      // Lida com campos padrão (como colaborador_id, etc)
      if (
        (name === "service_id" || 
        name === "status_id" || 
        name === "editorial_line_id" || 
        name === "product_id" || 
        name === "collaborator_id") && 
        (value === "" || value === "null")
      ) {
        if (name === "service_id" && currentSelectedEvent) {
          // mantém service_id
        } else {
          setFormData(prev => ({ ...prev, [name]: null }));
        }
      } else {
        setFormData(prev => ({ ...prev, [name]: value === "null" ? null : value }));
      }
    }

    setTimeout(() => { isUserEditing.current = false; }, 100);
  };

  return {
    currentSelectedEvent,
    formData,
    resetForm,
    handleSelectEvent,
    handleInputChange,
    handleSelectChange
  };
}
