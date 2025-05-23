import { useState, useEffect, useRef, useMemo } from "react";
import { format, parse, isValid, addMinutes } from "date-fns";
import { CalendarEvent, ContentScheduleFormData } from "@/types/oni-agencia";

interface UseScheduleFormStateProps {
  clientId: string;
  selectedDate: Date;
  selectedEvent?: CalendarEvent;
  prioritizeCaptureDate?: boolean;
  isOpen?: boolean; // Add isOpen parameter
}

// Function to parse a date string to Date object safely
function parseLocalDate(dateString: string | null): Date | null {
  if (!dateString) return null;
  
  try {
    // If string already has ISO format with time (T)
    if (dateString.includes('T')) {
      const date = new Date(dateString);
      return isValid(date) ? date : null;
    }
    
    // For simple YYYY-MM-DD formats
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    
    return null;
  } catch (e) {
    console.error("Error converting date:", e);
    return null;
  }
}

export function useScheduleFormState({
  clientId,
  selectedDate,
  selectedEvent,
  prioritizeCaptureDate = false,
  isOpen = false // Default to false if not provided
}: UseScheduleFormStateProps) {
  // Create a stable reference to the selected date to avoid recreation on each render
  const localSelectedDate = useMemo(() => new Date(selectedDate), [selectedDate]);
  
  const [currentSelectedEvent, setCurrentSelectedEvent] = useState<CalendarEvent | null>(selectedEvent || null);
  
  const [formData, setFormData] = useState<ContentScheduleFormData>(() => {
    // Initialize form data with proper date values
    const initialDate = localSelectedDate ? new Date(localSelectedDate) : new Date();
    
    return {
      client_id: clientId,
      service_id: "",
      collaborator_id: null,
      title: "",
      description: null,
      scheduled_date: prioritizeCaptureDate ? initialDate : initialDate, // Always set a default date
      execution_phase: null,
      editorial_line_id: null,
      product_id: null,
      status_id: null,
      creators: [],
      capture_date: prioritizeCaptureDate ? initialDate : null,
      capture_end_date: null,
      is_all_day: true,
      location: null
    };
  });
  
  // Use a ref to track when we're in the middle of user input
  const isUserEditing = useRef(false);
  
  // Flag to prevent infinite loops on date updates
  const hasUpdatedRef = useRef(false);

  // Update currentSelectedEvent when selectedEvent changes (even when it becomes undefined)
  useEffect(() => {
    if (selectedEvent) {
      setCurrentSelectedEvent(selectedEvent);
    } else {
      // Clear currentSelectedEvent when selectedEvent becomes undefined
      setCurrentSelectedEvent(null);
    }
  }, [selectedEvent]);

  // Update form when selectedDate changes - only if dialog is open
  useEffect(() => {
    // Only update if there's no selected event, user is not editing, we haven't updated yet, and dialog is open
    if (isOpen && !currentSelectedEvent && !isUserEditing.current && !hasUpdatedRef.current) {
      console.log("Updating form with selected date:", localSelectedDate);
      
      // Set the flag to true to prevent multiple updates
      hasUpdatedRef.current = true;
      
      setFormData(prev => {
        const updatedData: Partial<ContentScheduleFormData> = {};
        
        // Always update both dates to ensure we have valid dates
        if (prioritizeCaptureDate) {
          updatedData.capture_date = localSelectedDate;
          // Also update scheduled_date as a fallback for database requirements
          updatedData.scheduled_date = localSelectedDate;
        } else {
          updatedData.scheduled_date = localSelectedDate;
          
          // If there's no capture date yet, set it too
          if (!prev.capture_date) {
            updatedData.capture_date = localSelectedDate;
          }
        }
        
        return { ...prev, ...updatedData };
      });
      
      // Reset the flag after a while to allow future updates if needed
      setTimeout(() => {
        hasUpdatedRef.current = false;
      }, 500);
    }
  }, [localSelectedDate, currentSelectedEvent, prioritizeCaptureDate, isOpen]);

  const resetForm = () => {
    console.log("resetting form in useScheduleFormState");
    setCurrentSelectedEvent(null);
    hasUpdatedRef.current = false;
    
    const initialData: ContentScheduleFormData = {
      client_id: clientId,
      service_id: "",
      collaborator_id: null,
      title: "",
      description: null,
      scheduled_date: localSelectedDate, // Always set scheduled_date
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
    
    // Set the appropriate date field based on prioritizeCaptureDate
    if (prioritizeCaptureDate) {
      initialData.capture_date = localSelectedDate;
    }
    
    setFormData(initialData);
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
    let scheduledDate: Date | null = null;
    let captureDate: Date | null = null;
    let captureEndDate: Date | null = null;
    
    if (event.scheduled_date) {
      scheduledDate = parseLocalDate(event.scheduled_date);
    }
    
    if (event.capture_date) {
      captureDate = parseLocalDate(event.capture_date);
    }
    
    if (event.capture_end_date) {
      captureEndDate = parseLocalDate(event.capture_end_date);
    }
    
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
        if (!prioritizeCaptureDate && !formData.capture_date) {
          updatedData.capture_date = value;
        }
        
        setFormData(prev => ({ ...prev, ...updatedData }));
      } else if (name === "capture_date") {
        const updatedData: Partial<ContentScheduleFormData> = {
          [name]: value
        };
        
        // Always synchronize scheduled_date with capture_date 
        // This is critical - we always need a scheduled_date for the database
        updatedData.scheduled_date = value;
        
        setFormData(prev => ({ ...prev, ...updatedData }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      // If clearing capture_date, make sure scheduled_date remains
      if (name === "capture_date") {
        setFormData(prev => ({ ...prev, [name]: null }));
      } else if (name === "scheduled_date" && formData.capture_date) {
        // If clearing scheduled_date but we have capture_date, use that instead
        setFormData(prev => ({ ...prev, scheduled_date: formData.capture_date }));
      } else {
        setFormData(prev => ({ ...prev, [name]: null }));
      }
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
      
      if (name === "scheduled_date") {
        const updatedData: Partial<ContentScheduleFormData> = {
          [name]: value
        };
        
        // If capture_date exists, synchronize it preserving time
        if (formData.capture_date && !prioritizeCaptureDate) {
          let captureDate = new Date(value);
          if (formData.capture_date instanceof Date) {
            captureDate.setHours(formData.capture_date.getHours());
            captureDate.setMinutes(formData.capture_date.getMinutes());
          }
          updatedData.capture_date = captureDate;
        }
        
        setFormData(prev => ({ ...prev, ...updatedData }));
      } else if (name === "capture_date") {
        const updatedData: Partial<ContentScheduleFormData> = {
          [name]: value,
          // Always ensure scheduled_date is set - critical for database requirement
          scheduled_date: value 
        };
        
        // If capture_date is set and there's no end date yet (for non-all-day events)
        if (name === "capture_date" && !formData.capture_end_date && !formData.is_all_day) {
          // Create a default end time 30 minutes after start
          updatedData.capture_end_date = addMinutes(value, 30);
        }
        
        setFormData(prev => ({ ...prev, ...updatedData }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      // Special handling for null values
      if (name === "capture_date") {
        // If clearing capture_date but scheduled_date exists, keep that one
        setFormData(prev => ({ ...prev, [name]: null }));
      } else if (name === "scheduled_date" && formData.capture_date) {
        // If clearing scheduled_date but we have capture_date, use that
        setFormData(prev => ({ ...prev, scheduled_date: formData.capture_date }));
      } else {
        setFormData(prev => ({ ...prev, [name]: null }));
      }
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
      
      if (formData.capture_date instanceof Date) {
        // Keep just the date part (reset time to midnight)
        updatedData.capture_date = new Date(
          formData.capture_date.getFullYear(),
          formData.capture_date.getMonth(),
          formData.capture_date.getDate()
        );
      }
      
      if (formData.capture_end_date instanceof Date) {
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
      
      if (formData.capture_date instanceof Date) {
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
      
      if (formData.capture_end_date instanceof Date) {
        const endDate = new Date(formData.capture_end_date);
        endDate.setHours(currentHours);
        endDate.setMinutes(currentMinutes + 30);
        
        if (formData.capture_date && updatedData.capture_date instanceof Date) {
          // Make sure end date is at least 30 min after start
          const minEndDate = addMinutes(updatedData.capture_date, 30);
          
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
