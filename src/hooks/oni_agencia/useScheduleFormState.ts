
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
  const [formData, setFormData] = useState<ContentScheduleFormData>({
    client_id: clientId,
    service_id: "",
    collaborator_id: null,
    title: "", // Change to empty string instead of null
    description: null,
    scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
    execution_phase: null,
    editorial_line_id: null,
    product_id: null,
    status_id: null
  });
  
  // Use a ref to track when we're in the middle of user input
  const isUserEditing = useRef(false);

  // Set the selectedEvent when it comes from props - only on initial mount or when selectedEvent changes
  useEffect(() => {
    if (selectedEvent && !isUserEditing.current) {
      console.log("useScheduleFormState selectedEvent effect:", selectedEvent.id);
      handleSelectEvent(selectedEvent);
    }
  }, [selectedEvent]);

  const resetForm = () => {
    console.log("resetting form in useScheduleFormState");
    setCurrentSelectedEvent(null);
    setFormData({
      client_id: clientId,
      service_id: "",
      collaborator_id: null,
      title: "", // Change to empty string instead of null
      description: null,
      scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
      execution_phase: null,
      editorial_line_id: null,
      product_id: null,
      status_id: null
    });
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    console.log("selecting event in useScheduleFormState:", event.id);
    setCurrentSelectedEvent(event);
    setFormData({
      client_id: event.client_id,
      service_id: event.service_id,
      collaborator_id: event.collaborator_id,
      title: event.title || "", // Ensure we never have null here 
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
    console.log("Input changed:", name, value);
    
    // Set the flag to indicate user is editing
    isUserEditing.current = true;
    
    setFormData(prev => ({ ...prev, [name]: value || (name === "title" ? "" : null) }));
    
    // Reset the flag after a short delay
    setTimeout(() => {
      isUserEditing.current = false;
    }, 100);
  };

  const handleSelectChange = (name: string, value: string) => {
    console.log("Select changed:", name, value);
    
    // Set the flag to indicate user is editing
    isUserEditing.current = true;
    
    setFormData(prev => ({ ...prev, [name]: value === "null" ? null : value }));
    
    // Reset the flag after a short delay
    setTimeout(() => {
      isUserEditing.current = false;
    }, 100);
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
