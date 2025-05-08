
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
    creators: [], // Initialize as empty array
    capture_date: null, // Add newly required fields
    capture_end_date: null,
    is_all_day: true,
    location: null
  });
  
  // Use a ref to track when we're in the middle of user input
  const isUserEditing = useRef(false);

  // Set the selectedEvent when it comes from props
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
      creators: [], // Reset to empty array
      capture_date: null, // Add newly required fields
      capture_end_date: null,
      is_all_day: true,
      location: null
    });
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    console.log("selecting event in useScheduleFormState:", event.id);
    setCurrentSelectedEvent(event);
    
    // Garantir tratamento abrangente para creators
    let creatorsArray: string[] = [];
    
    if (event.creators !== null && event.creators !== undefined) {
      if (Array.isArray(event.creators)) {
        creatorsArray = event.creators;
      } else if (typeof event.creators === 'string') {
        try {
          // Tenta parsear como JSON se for string
          const parsed = JSON.parse(event.creators as string);
          creatorsArray = Array.isArray(parsed) ? parsed : [String(parsed)];
        } catch {
          // Se falhar no parse, trata como um único item
          creatorsArray = [String(event.creators)];
        }
      } else {
        // Para qualquer outro tipo, converte para string e usa como item único
        creatorsArray = [String(event.creators)];
      }
    }
    
    setFormData({
      client_id: event.client_id,
      service_id: event.service_id || "", // Garantir que nunca seja null
      collaborator_id: event.collaborator_id,
      title: event.title || "", // Garantir que nunca seja null
      description: event.description,
      scheduled_date: event.scheduled_date,
      execution_phase: event.execution_phase,
      editorial_line_id: event.editorial_line_id,
      product_id: event.product_id,
      status_id: event.status_id,
      creators: creatorsArray, // Sempre um array válido
      capture_date: event.capture_date || null,  // Include new fields
      capture_end_date: event.capture_end_date || null,
      is_all_day: event.is_all_day !== null ? event.is_all_day : true,
      location: event.location || null
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
        let creatorsArray: string[] = [];
        
        if (value) {
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
              creatorsArray = parsed;
            } else if (parsed) {
              creatorsArray = [String(parsed)];
            }
          } catch (e) {
            console.error("Falha ao analisar JSON de creators:", e);
          }
        }
        
        console.log("handleSelectChange - Setting creators to:", creatorsArray);
        setFormData(prev => ({ ...prev, creators: creatorsArray }));
      } catch (e) {
        console.error("Erro ao analisar JSON de creators:", e);
        setFormData(prev => ({ ...prev, creators: [] }));
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
  
  const handleDateChange = (name: string, value: Date | null) => {
    console.log("Date changed:", name, value);
    
    isUserEditing.current = true;
    
    if (value) {
      const formattedDate = format(value, "yyyy-MM-dd");
      setFormData(prev => ({ ...prev, [name]: formattedDate }));
    } else {
      setFormData(prev => ({ ...prev, [name]: null }));
    }
    
    setTimeout(() => {
      isUserEditing.current = false;
    }, 100);
  };

  // New handler for date-time fields
  const handleDateTimeChange = (name: string, value: Date | null) => {
    console.log("DateTime changed:", name, value);
    
    isUserEditing.current = true;
    
    if (value) {
      const formattedDateTime = format(value, "yyyy-MM-dd'T'HH:mm:ss");
      setFormData(prev => ({ ...prev, [name]: formattedDateTime }));
    } else {
      setFormData(prev => ({ ...prev, [name]: null }));
    }
    
    setTimeout(() => {
      isUserEditing.current = false;
    }, 100);
  };

  // New handler for all-day toggle
  const handleAllDayChange = (value: boolean) => {
    console.log("AllDay changed:", value);
    
    isUserEditing.current = true;
    setFormData(prev => ({ ...prev, is_all_day: value }));
    
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
    handleSelectChange,
    handleDateChange,
    handleDateTimeChange,
    handleAllDayChange
  };
}
