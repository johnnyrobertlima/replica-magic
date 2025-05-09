
import { useState, useEffect, useRef } from "react";
import { format, addMinutes } from "date-fns";
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
  
  // Formato padronizado para garantir consistência nas datas
  const formattedDate = format(localSelectedDate, 'yyyy-MM-dd');
  
  const [formData, setFormData] = useState<ContentScheduleFormData>({
    client_id: clientId,
    service_id: "",
    collaborator_id: null,
    title: "",
    description: null,
    scheduled_date: prioritizeCaptureDate ? null : formattedDate,
    execution_phase: null,
    editorial_line_id: null,
    product_id: null,
    status_id: null,
    creators: [],
    capture_date: prioritizeCaptureDate ? formattedDate : null,
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
      const formattedDate = format(localSelectedDate, 'yyyy-MM-dd');
      console.log("Updating form with selected date:", formattedDate);
      
      setFormData(prev => ({
        ...prev,
        scheduled_date: prioritizeCaptureDate ? prev.scheduled_date : formattedDate,
        capture_date: prioritizeCaptureDate ? formattedDate : prev.capture_date
      }));
    }
  }, [localSelectedDate, currentSelectedEvent, prioritizeCaptureDate]);

  const resetForm = () => {
    console.log("resetting form in useScheduleFormState");
    setCurrentSelectedEvent(null);
    const formattedDate = format(localSelectedDate, 'yyyy-MM-dd');
    setFormData({
      client_id: clientId,
      service_id: "",
      collaborator_id: null,
      title: "",
      description: null,
      scheduled_date: prioritizeCaptureDate ? null : formattedDate,
      execution_phase: null,
      editorial_line_id: null,
      product_id: null,
      status_id: null,
      creators: [],
      capture_date: prioritizeCaptureDate ? formattedDate : null,
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
    
    // Garantir que as datas sejam consistentes
    const captureDate = event.capture_date || null;
    const scheduledDate = event.scheduled_date || formattedDate;
    
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
      capture_end_date: event.capture_end_date,
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
  
  // Add handleDateChange function
  const handleDateChange = (name: string, value: Date | null) => {
    console.log("Date changed:", name, value);
    
    isUserEditing.current = true;
    
    if (value) {
      // Make sure we're using the exact date selected without timezone adjustments
      const formattedDate = format(value, "yyyy-MM-dd");
      console.log(`Setting ${name} to:`, formattedDate);
      
      // Logic to sync capture_date and scheduled_date
      if (name === "scheduled_date") {
        setFormData(prev => ({ 
          ...prev, 
          scheduled_date: formattedDate,
          // Synchronize capture_date with scheduled_date if prioritizeCaptureDate is false
          ...(prioritizeCaptureDate ? {} : { capture_date: formattedDate })
        }));
      } else if (name === "capture_date") {
        setFormData(prev => ({ 
          ...prev, 
          capture_date: formattedDate,
          // Synchronize scheduled_date with capture_date if prioritizeCaptureDate is true
          ...(prioritizeCaptureDate ? { scheduled_date: formattedDate } : {})
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: formattedDate }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: null }));
    }
    
    setTimeout(() => {
      isUserEditing.current = false;
    }, 100);
  };

  // Add a new handler for dateTime fields (with time)
  const handleDateTimeChange = (name: string, value: Date | null) => {
    console.log("DateTime changed:", name, value);
    
    isUserEditing.current = true;
    
    if (value) {
      // Fix: Use a consistent format that preserves the exact date and time
      const formattedDateTime = format(value, "yyyy-MM-dd'T'HH:mm:ss");
      console.log(`Formatted dateTime for ${name}:`, formattedDateTime);
      
      // Se estamos atualizando uma data e a outra data relacionada deveria ser sincronizada,
      // atualize ambas para manter consistência
      if (name === "scheduled_date" && !prioritizeCaptureDate) {
        const dateOnly = formattedDateTime.split('T')[0];
        setFormData(prev => ({ 
          ...prev, 
          [name]: formattedDateTime,
          // Se capture_date existe e tiver tempo, mantenha o tempo
          capture_date: prev.capture_date?.includes('T') 
            ? `${dateOnly}${prev.capture_date.substring(prev.capture_date.indexOf('T'))}`
            : dateOnly
        }));
      } else if (name === "capture_date" && prioritizeCaptureDate) {
        const dateOnly = formattedDateTime.split('T')[0];
        setFormData(prev => ({ 
          ...prev, 
          [name]: formattedDateTime,
          // Se scheduled_date existe e tiver tempo, mantenha o tempo
          scheduled_date: prev.scheduled_date?.includes('T') 
            ? `${dateOnly}${prev.scheduled_date.substring(prev.scheduled_date.indexOf('T'))}` 
            : dateOnly
        }));
      } else if (name === "capture_date" && !formData.capture_end_date && !formData.is_all_day) {
        // If setting a start date with specific time and no end date exists, 
        // automatically create an end date 30 minutes later
        const endDate = addMinutes(value, 30);
        const formattedEndDateTime = format(endDate, "yyyy-MM-dd'T'HH:mm:ss");
        
        setFormData(prev => ({ 
          ...prev, 
          [name]: formattedDateTime,
          capture_end_date: formattedEndDateTime
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: formattedDateTime }));
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
      // When switching to all-day, remove time component from dates
      const updatedData: Partial<ContentScheduleFormData> = {
        is_all_day: true
      };
      
      if (formData.capture_date) {
        // Keep just the date part
        updatedData.capture_date = formData.capture_date.split('T')[0];
      }
      
      if (formData.capture_end_date) {
        // Keep just the date part
        updatedData.capture_end_date = formData.capture_end_date.split('T')[0];
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
        const datePart = formData.capture_date.split('T')[0];
        const date = new Date(`${datePart}T${currentHours}:${currentMinutes}:00`);
        updatedData.capture_date = format(date, "yyyy-MM-dd'T'HH:mm:ss");
        
        // Also set end time if not already set
        if (!formData.capture_end_date) {
          const endDate = addMinutes(date, 30);
          updatedData.capture_end_date = format(endDate, "yyyy-MM-dd'T'HH:mm:ss");
        }
      }
      
      if (formData.capture_end_date) {
        // Add time to the existing end date, ensuring it's at least 30 minutes after start
        const datePart = formData.capture_end_date.split('T')[0];
        let endDate: Date;
        
        if (formData.capture_date && updatedData.capture_date) {
          // Make sure end date is at least 30 min after start
          const startDate = new Date(updatedData.capture_date);
          const minEndDate = addMinutes(startDate, 30);
          endDate = new Date(`${datePart}T${currentHours}:${currentMinutes + 30}:00`);
          
          // If the calculated end date is before min end date, use min end date
          if (endDate < minEndDate) {
            endDate = minEndDate;
          }
        } else {
          endDate = new Date(`${datePart}T${currentHours}:${currentMinutes + 30}:00`);
        }
        
        updatedData.capture_end_date = format(endDate, "yyyy-MM-dd'T'HH:mm:ss");
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
