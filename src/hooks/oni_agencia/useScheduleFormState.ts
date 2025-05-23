import { useState, useEffect, useRef } from "react";
import { format, addMinutes, parseISO, parse } from "date-fns";
import { CalendarEvent, ContentScheduleFormData } from "@/types/oni-agencia";

// Helper to serialize form data, converting Date objects to ISO strings
const serializeFormData = (data: ContentScheduleFormData) => {
  return JSON.stringify(data, (_, value) =>
    value instanceof Date ? value.toISOString() : value
  );
};

// Helper to deserialize form data from localStorage
const deserializeFormData = (data: string): ContentScheduleFormData => {
  const parsed = JSON.parse(data);
  const parseDate = (v: any) => (v ? new Date(v) : null);
  return {
    ...parsed,
    scheduled_date: parseDate(parsed.scheduled_date),
    capture_date: parseDate(parsed.capture_date),
    capture_end_date: parseDate(parsed.capture_end_date)
  } as ContentScheduleFormData;
};

interface UseScheduleFormStateProps {
  clientId: string;
  selectedDate: Date;
  selectedEvent?: CalendarEvent;
  prioritizeCaptureDate?: boolean;
  isOpen?: boolean;
}

export function useScheduleFormState({
  clientId,
  selectedDate,
  selectedEvent,
  prioritizeCaptureDate = false,
  isOpen = false
}: UseScheduleFormStateProps) {
  const [currentSelectedEvent, setCurrentSelectedEvent] = useState<CalendarEvent | null>(selectedEvent || null);
  
  // Clone the selectedDate to avoid timezone issues
  const localSelectedDate = new Date(selectedDate);
  
  // Mantendo objetos Date no estado ao invés de strings
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

  // Key for persisting form data
  const localStorageKey = `oni_agencia_schedule_form_${clientId}_${
    selectedEvent?.id ?? 'new'}`;

  // Load saved data when dialog opens
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem(localStorageKey);
      if (saved) {
        try {
          setFormData(deserializeFormData(saved));
        } catch (err) {
          console.error('Failed to parse saved form data', err);
        }
      }
    }
  }, [isOpen, localStorageKey]);

  // Persist form data while editing
  useEffect(() => {
    if (isOpen) {
      try {
        localStorage.setItem(localStorageKey, serializeFormData(formData));
      } catch (err) {
        console.error('Failed to save form data', err);
      }
    }
  }, [formData, isOpen, localStorageKey]);

  // Clear saved data when dialog closes
  useEffect(() => {
    if (!isOpen) {
      localStorage.removeItem(localStorageKey);
    }
  }, [isOpen, localStorageKey]);
  
  // Use a ref to track when we're in the middle of user input
  const isUserEditing = useRef(false);
  
  // Flag to prevent infinite loops on date updates
  const hasUpdatedRef = useRef(false);

  // Set the selectedEvent when it comes from props
  useEffect(() => {
    if (selectedEvent) {
      console.log("useScheduleFormState selectedEvent effect:", selectedEvent.id);
      handleSelectEvent(selectedEvent);
    } else {
      // Clear currentSelectedEvent when selectedEvent becomes undefined
      setCurrentSelectedEvent(null);
    }
  }, [selectedEvent]);

  // Update form when selectedDate changes to keep dates in sync
  useEffect(() => {
    // Only update if there's no selected event, user is not editing, we haven't updated yet, and dialog is open
    if (isOpen && !currentSelectedEvent && !isUserEditing.current && !hasUpdatedRef.current) {
      console.log("Updating form with selected date:", localSelectedDate);
      
      // Set the flag to true to prevent multiple updates
      hasUpdatedRef.current = true;
      
      setFormData(prev => ({
        ...prev,
        [prioritizeCaptureDate ? 'capture_date' : 'scheduled_date']: localSelectedDate
      }));
      
      // Reset the flag after a while to allow future updates if needed
      setTimeout(() => {
        hasUpdatedRef.current = false;
      }, 500);
    }
  }, [localSelectedDate, currentSelectedEvent, prioritizeCaptureDate, isOpen]);

  const resetForm = () => {
    console.log("Resetting form in useScheduleFormState - FULL RESET");

    // Remove any persisted data for this form
    localStorage.removeItem(localStorageKey);
    
    // First explicitly set currentSelectedEvent to null
    setCurrentSelectedEvent(null);
    
    // Then reset all form data
    const initialData: ContentScheduleFormData = {
      client_id: clientId,
      service_id: "",
      collaborator_id: null,
      title: "",
      description: null,
      scheduled_date: null,
      execution_phase: null,
      editorial_line_id: null,
      product_id: null,
      status_id: null,
      creators: [],
      capture_date: null,
      capture_end_date: null,
      is_all_day: true,
      location: null
    };
    
    // Mantendo objeto Date, não string
    if (prioritizeCaptureDate) {
      initialData.capture_date = localSelectedDate;
    } else {
      initialData.scheduled_date = localSelectedDate;
    }
    
    // Set the form data with the initial values
    setFormData(initialData);
    
    console.log("Form reset complete - currentSelectedEvent is now:", null);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    if (!event) {
      console.log("handleSelectEvent called with null/undefined event - clearing selected event");
      setCurrentSelectedEvent(null);
      return;
    }
    
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
    
    // Process dates from the event
    let scheduledDate: Date | null = null;
    let captureDate: Date | null = null;
    let captureEndDate: Date | null = null;
    
    // Handle scheduled_date (from the main content schedule)
    if (event.scheduled_date) {
      try {
        if (typeof event.scheduled_date === 'string') {
          scheduledDate = parse(
            event.scheduled_date,
            'yyyy-MM-dd',
            new Date()
          );
        } else if (event.scheduled_date instanceof Date) {
          scheduledDate = event.scheduled_date;
        }
      } catch (e) {
        console.error("Erro ao converter scheduled_date:", e);
        scheduledDate = null;
      }
    }
    
    // Handle capture_date (from the related capture record)
    if (event.capture_date) {
      try {
        if (typeof event.capture_date === 'string') {
          // Try to parse capture_date as a full ISO string or date-only string
          captureDate = event.capture_date.includes('T') 
            ? new Date(event.capture_date)
            : parse(event.capture_date, 'yyyy-MM-dd', new Date());
        } else if (event.capture_date instanceof Date) {
          captureDate = event.capture_date;
        }
      } catch (e) {
        console.error("Erro ao converter capture_date:", e);
        captureDate = null;
      }
    }
    
    // Handle capture_end_date (from the related capture record)
    if (event.capture_end_date) {
      try {
        if (typeof event.capture_end_date === 'string') {
          // Try to parse capture_end_date as a full ISO string or date-only string
          captureEndDate = event.capture_end_date.includes('T')
            ? new Date(event.capture_end_date)
            : parse(event.capture_end_date, 'yyyy-MM-dd', new Date());
        } else if (event.capture_end_date instanceof Date) {
          captureEndDate = event.capture_end_date;
        }
      } catch (e) {
        console.error("Erro ao converter capture_end_date:", e);
        captureEndDate = null;
      }
    }
    
    // Populate form data with the event information
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
  
  // Agora mantemos o valor Date diretamente no estado
  const handleDateChange = (name: string, value: Date | null) => {
    console.log("Date changed:", name, value);
    
    isUserEditing.current = true;
    
    if (value) {
      // Keep the original Date object in state
      console.log(`Setting ${name} to Date:`, value);
      
      // Logic to sync capture_date and scheduled_date
      if (name === "scheduled_date") {
        const updatedData: Partial<ContentScheduleFormData> = {
          [name]: value
        };
        
        // Synchronize capture_date with scheduled_date if prioritizeCaptureDate is false
        if (!prioritizeCaptureDate) {
          updatedData.capture_date = value;
        }
        
        setFormData(prev => ({ ...prev, ...updatedData }));
      } else if (name === "capture_date") {
        const updatedData: Partial<ContentScheduleFormData> = {
          [name]: value
        };
        
        // Synchronize scheduled_date with capture_date if prioritizeCaptureDate is true
        if (prioritizeCaptureDate) {
          updatedData.scheduled_date = value;
        }
        
        setFormData(prev => ({ ...prev, ...updatedData }));
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
        const updatedData: Partial<ContentScheduleFormData> = {
          [name]: value
        };
        
        // If capture_date exists, synchronize it preserving time
        if (formData.capture_date) {
          let captureDate: Date;
          
          if (formData.capture_date instanceof Date) {
            captureDate = new Date(value);
            captureDate.setHours(formData.capture_date.getHours());
            captureDate.setMinutes(formData.capture_date.getMinutes());
          } else {
            captureDate = new Date(value);
          }
          
          updatedData.capture_date = captureDate;
        } else {
          updatedData.capture_date = value;
        }
        
        setFormData(prev => ({ ...prev, ...updatedData }));
      } else if (name === "capture_date" && prioritizeCaptureDate) {
        const updatedData: Partial<ContentScheduleFormData> = {
          [name]: value
        };
        
        // If scheduled_date exists, synchronize it preserving time
        if (formData.scheduled_date) {
          let scheduledDate: Date;
          
          if (formData.scheduled_date instanceof Date) {
            scheduledDate = new Date(value);
            scheduledDate.setHours(formData.scheduled_date.getHours());
            scheduledDate.setMinutes(formData.scheduled_date.getMinutes());
          } else {
            scheduledDate = new Date(value);
          }
          
          updatedData.scheduled_date = scheduledDate;
        } else {
          updatedData.scheduled_date = value;
        }
        
        setFormData(prev => ({ ...prev, ...updatedData }));
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
        // Use proper type handling for null checks and Date checks
        if (formData.capture_date instanceof Date) {
          // Keep just the date part (reset time to midnight)
          updatedData.capture_date = new Date(
            formData.capture_date.getFullYear(),
            formData.capture_date.getMonth(),
            formData.capture_date.getDate()
          );
        } else if (formData.capture_date) {  // Then check if it exists (could be any type)
          try {
            // Handle the case where captureDate is not a Date object
            const parsedDate = new Date(formData.capture_date as any);
            updatedData.capture_date = new Date(
              parsedDate.getFullYear(),
              parsedDate.getMonth(),
              parsedDate.getDate()
            );
          } catch (e) {
            console.error("Error parsing capture_date:", e);
            updatedData.capture_date = new Date();
          }
        }
      }
      
      if (formData.capture_end_date) {
        // Use proper type handling for null checks and Date checks
        if (formData.capture_end_date instanceof Date) {
          // Keep just the date part (reset time to midnight)
          updatedData.capture_end_date = new Date(
            formData.capture_end_date.getFullYear(),
            formData.capture_end_date.getMonth(),
            formData.capture_end_date.getDate()
          );
        } else if (formData.capture_end_date) {  // Then check if it exists (could be any type)
          try {
            // Handle the case where captureEndDate is not a Date object
            const parsedDate = new Date(formData.capture_end_date as any);
            updatedData.capture_end_date = new Date(
              parsedDate.getFullYear(),
              parsedDate.getMonth(),
              parsedDate.getDate()
            );
          } catch (e) {
            console.error("Error parsing capture_end_date:", e);
            updatedData.capture_end_date = new Date();
          }
        }
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
        let date: Date;
        
        if (formData.capture_date instanceof Date) {
          date = new Date(formData.capture_date);
        } else {
          try {
            // Handle the case where captureDate is not a Date object
            date = new Date(formData.capture_date as any);
          } catch (e) {
            console.error("Error parsing capture_date:", e);
            date = new Date();
          }
        }
        
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
        let endDate: Date;
        
        if (formData.capture_end_date instanceof Date) {
          endDate = new Date(formData.capture_end_date);
        } else {
          try {
            // Handle the case where captureEndDate is not a Date object
            endDate = new Date(formData.capture_end_date as any);
          } catch (e) {
            console.error("Error parsing capture_end_date:", e);
            endDate = addMinutes(new Date(), 30);
          }
        }
        
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
