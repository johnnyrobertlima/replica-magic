
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
    title: "",
    description: null,
    scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
    execution_phase: null,
    editorial_line_id: null,
    product_id: null,
    status_id: null,
    creators: [] // Initialize as empty array
  });
  
  const isUserEditing = useRef(false);

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
      title: "",
      description: null,
      scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
      execution_phase: null,
      editorial_line_id: null,
      product_id: null,
      status_id: null,
      creators: [] // Reset to empty array
    });
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    console.log("selecting event in useScheduleFormState:", event.id);
    setCurrentSelectedEvent(event);
    
    // Ensure creators is always handled as an array
    let creatorsArray: string[] = [];
    
    // If creators exists in event
    if (event.creators) {
      // If it's already an array, use it
      if (Array.isArray(event.creators)) {
        creatorsArray = event.creators;
      } 
      // If it's a string, try to parse it (in case it's JSON)
      else if (typeof event.creators === 'string') {
        try {
          const parsed = JSON.parse(event.creators);
          creatorsArray = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          // If parsing fails, treat as a single item
          creatorsArray = [event.creators as string];
        }
      } 
      // For any other type, convert to string and use as single item
      else {
        creatorsArray = [String(event.creators)];
      }
    }
    
    setFormData({
      client_id: event.client_id,
      service_id: event.service_id || "", // Ensure it's never null
      collaborator_id: event.collaborator_id,
      title: event.title || "", // Ensure it's never null
      description: event.description,
      scheduled_date: event.scheduled_date,
      execution_phase: event.execution_phase,
      editorial_line_id: event.editorial_line_id,
      product_id: event.product_id,
      status_id: event.status_id,
      creators: creatorsArray
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log("Input changed:", name, value);
    
    isUserEditing.current = true;
    
    setFormData(prev => ({ ...prev, [name]: value || (name === "title" ? "" : null) }));
    
    setTimeout(() => {
      isUserEditing.current = false;
    }, 100);
  };

  const handleSelectChange = (name: string, value: string) => {
    console.log("Select changed:", name, value);
    
    isUserEditing.current = true;
    
    if (name === "creators") {
      try {
        let creatorsArray = [];
        
        if (value) {
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
              creatorsArray = parsed;
            } else if (parsed) {
              creatorsArray = [parsed];
            }
          } catch (e) {
            console.error("Failed to parse creators JSON:", e);
          }
        }
        
        setFormData(prev => ({ ...prev, [name]: creatorsArray }));
      } catch (e) {
        console.error("Error parsing creators JSON:", e);
        setFormData(prev => ({ ...prev, [name]: [] }));
      }
    } else {
      if (
        (name === "service_id" || 
        name === "status_id" || 
        name === "editorial_line_id" || 
        name === "product_id" || 
        name === "collaborator_id") && 
        (value === "" || value === "null")
      ) {
        if (name === "service_id" && currentSelectedEvent) {
          console.log("Keeping existing service_id for required field");
        } else {
          setFormData(prev => ({ ...prev, [name]: null }));
        }
      } else {
        setFormData(prev => ({ ...prev, [name]: value === "null" ? null : value }));
      }
    }
    
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
