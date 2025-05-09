import { useState, useEffect, useRef } from "react";
import { format, addMinutes, parseISO } from "date-fns";
import { CalendarEvent, ContentScheduleFormData } from "@/types/oni-agencia";

interface UseScheduleFormStateProps {
  clientId: string;
  selectedDate: Date;
  selectedEvent?: CalendarEvent;
  prioritizeCaptureDate?: boolean;
}

export function useScheduleFormState({
  clientId,
  selectedDate,
  selectedEvent,
  prioritizeCaptureDate = false
}: UseScheduleFormStateProps) {
  const [currentSelectedEvent, setCurrentSelectedEvent] = useState<CalendarEvent | null>(selectedEvent || null);
  
  // Clone the selectedDate to avoid timezone issues
  const localSelectedDate = new Date(selectedDate);
  
  const [formData, setFormData] = useState<ContentScheduleFormData>({
    client_id: clientId,
    service_id: "",
    collaborator_id: null,
    title: "",
    description: null,
    scheduled_date: prioritizeCaptureDate ? null : localSelectedDate,
    execution_phase: null,
    editorial_line_id: null,
    product_id: null,
    status_id: null,
    creators: [],
    capture_date: prioritizeCaptureDate ? localSelectedDate : null,
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

  // Update form when selectedDate changes to keep dates in sync
  useEffect(() => {
    if (!currentSelectedEvent && !isUserEditing.current) {
      // Only update if there's no selected event and user is not editing
      console.log("Updating form with selected date:", localSelectedDate);
      
      setFormData(prev => ({
        ...prev,
        scheduled_date: prioritizeCaptureDate ? prev.scheduled_date : localSelectedDate,
        capture_date: prioritizeCaptureDate ? localSelectedDate : prev.capture_date
      }));
    }
  }, [localSelectedDate, currentSelectedEvent, prioritizeCaptureDate]);

  const resetForm = () => {
    console.log("resetting form in useScheduleFormState");
    setCurrentSelectedEvent(null);
    setFormData({
      client_id: clientId,
      service_id: "",
      collaborator_id: null,
      title: "",
      description: null,
      scheduled_date: prioritizeCaptureDate ? null : localSelectedDate,
      execution_phase: null,
      editorial_line_id: null,
      product_id: null,
      status_id: null,
      creators: [],
      capture_date: prioritizeCaptureDate ? localSelectedDate : null,
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
    
    // Converter datas de string para objetos Date
    const captureDate = event.capture_date ? parseISO(event.capture_date) : null;
    const captureEndDate = event.capture_end_date ? parseISO(event.capture_end_date) : null;
    const scheduledDate = event.scheduled_date ? parseISO(event.scheduled_date) : localSelectedDate;
    
    setFormData({
      client_id: event.client_id,
      service_id: event.service_id || "", // Garantir que nunca seja null
      collaborator_id: event.collaborator_id,
      title: event.title || "", // Garantir que nunca seja null
      description: event.description,
      scheduled_date: scheduledDate,
      execution_phase: event.execution_phase,
      editorial_line_id: event.editorial_line_id,
      product_id: event.product_id,
      status_id: event.status_id,
      creators: creatorsArray, // Sempre um array válido
      capture_date: captureDate,
      capture_end_date: captureEndDate,
      is_all_day: event.is_all_day !== undefined ? event.is_all_day : true,
      location: event.location
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
        (value === "null")
      ) {
        setFormData(prev => ({ ...prev, [name]: null }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value === "null" ? null : value }));
      }
    }
    
    setTimeout(() => {
      isUserEditing.current = false;
    }, 100);
  };
  
  // Atualizado para trabalhar com objeto Date diretamente
  const handleDateChange = (name: string, value: Date | null) => {
    console.log("Date changed:", name, value);
    
    isUserEditing.current = true;
    
    if (value) {
      // Keep the original Date object in state
      console.log(`Setting ${name} to Date:`, value);
      
      // Logic to sync capture_date and scheduled_date
      if (name === "scheduled_date") {
        setFormData(prev => ({ 
          ...prev, 
          scheduled_date: value,
          // Synchronize capture_date with scheduled_date if prioritizeCaptureDate is false
          ...(prioritizeCaptureDate ? {} : { capture_date: value })
        }));
      } else if (name === "capture_date") {
        setFormData(prev => ({ 
          ...prev, 
          capture_date: value,
          // Synchronize scheduled_date with capture_date if prioritizeCaptureDate is true
          ...(prioritizeCaptureDate ? { scheduled_date: value } : {})
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: null }));
    }
    
    setTimeout(() => {
      isUserEditing.current = false;
    }, 100);
  };

  // Atualizado para trabalhar com objeto Date diretamente
  const handleDateTimeChange = (name: string, value: Date | null) => {
    console.log("DateTime changed:", name, value);
    
    isUserEditing.current = true;
    
    if (value) {
      console.log(`Setting DateTime for ${name}:`, value);
      
      if (name === "scheduled_date" && !prioritizeCaptureDate) {
        setFormData(prev => ({ 
          ...prev, 
          [name]: value,
          // Se prioritizeCaptureDate é false, sincronize capture_date com scheduled_date
          // Preservando a hora se capture_date existir
          capture_date: prev.capture_date 
            ? new Date(value.getFullYear(), value.getMonth(), value.getDate(), 
                prev.capture_date.getHours(), prev.capture_date.getMinutes())
            : value
        }));
      } else if (name === "capture_date" && prioritizeCaptureDate) {
        setFormData(prev => ({ 
          ...prev, 
          [name]: value,
          // Se prioritizeCaptureDate é true, sincronize scheduled_date com capture_date
          // Preservando a hora se scheduled_date existir
          scheduled_date: prev.scheduled_date
            ? new Date(value.getFullYear(), value.getMonth(), value.getDate(),
                prev.scheduled_date.getHours(), prev.scheduled_date.getMinutes())
            : value
        }));
      } else if (name === "capture_date" && !formData.capture_end_date && !formData.is_all_day) {
        // Se definindo uma data de início com hora específica e não existe data de término,
        // crie automaticamente uma data de término 30 minutos depois
        const endDate = addMinutes(value, 30);
        
        setFormData(prev => ({ 
          ...prev, 
          [name]: value,
          capture_end_date: endDate
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: null }));
    }
    
    setTimeout(() => {
      isUserEditing.current = false;
    }, 100);
  };

  // Add a handler for the all-day checkbox
  const handleAllDayChange = (isAllDay: boolean) => {
    console.log("All day changed:", isAllDay);
    
    isUserEditing.current = true;
    
    if (isAllDay) {
      // When switching to all-day, preserve only the date part
      const updatedData: Partial<ContentScheduleFormData> = {
        is_all_day: true
      };
      
      if (formData.capture_date) {
        // Keep just the date part (reset time to midnight)
        updatedData.capture_date = new Date(
          formData.capture_date.getFullYear(),
          formData.capture_date.getMonth(),
          formData.capture_date.getDate()
        );
      }
      
      if (formData.capture_end_date) {
        // Keep just the date part (reset time to midnight)
        updatedData.capture_end_date = new Date(
          formData.capture_end_date.getFullYear(),
          formData.capture_end_date.getMonth(),
          formData.capture_end_date.getDate()
        );
      }
      
      setFormData(prev => ({ ...prev, ...updatedData }));
    } else {
      // When switching to specific time, add default time component (current time)
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      
      const updatedData: Partial<ContentScheduleFormData> = {
        is_all_day: false
      };
      
      if (formData.capture_date) {
        // Add time to the existing date
        const date = new Date(formData.capture_date);
        date.setHours(currentHours);
        date.setMinutes(currentMinutes);
        updatedData.capture_date = date;
        
        // Also set end time if not already set
        if (!formData.capture_end_date) {
          const endDate = addMinutes(date, 30);
          updatedData.capture_end_date = endDate;
        }
      }
      
      if (formData.capture_end_date) {
        // Add time to the existing end date, ensuring it's at least 30 minutes after start
        const endDate = new Date(formData.capture_end_date);
        endDate.setHours(currentHours);
        endDate.setMinutes(currentMinutes + 30);
        
        if (formData.capture_date && updatedData.capture_date) {
          // Make sure end date is at least 30 min after start
          const startDate = updatedData.capture_date;
          const minEndDate = addMinutes(startDate, 30);
          
          // If the calculated end date is before min end date, use min end date
          if (endDate < minEndDate) {
            updatedData.capture_end_date = minEndDate;
          } else {
            updatedData.capture_end_date = endDate;
          }
        } else {
          updatedData.capture_end_date = endDate;
        }
      }
      
      setFormData(prev => ({ ...prev, ...updatedData }));
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
    handleSelectChange,
    handleDateChange,
    handleDateTimeChange,
    handleAllDayChange
  };
}
