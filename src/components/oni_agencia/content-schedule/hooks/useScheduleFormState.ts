
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
    creators: [],
    capture_date: null // Add the capture_date field
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
      creators: [],
      capture_date: null // Add the capture_date field
    });
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    console.log("selecting event in useScheduleFormState:", event.id);
    setCurrentSelectedEvent(event);
    
    // Ensure we properly map null or empty values
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
      creators: Array.isArray(event.creators) ? event.creators : [], // Ensure creators is always an array
      capture_date: event.capture_date // Add the capture_date field
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
    
    // Special handling for creators which is an array
    if (name === "creators") {
      try {
        // Make sure we parse the JSON string correctly, and default to empty array if it fails
        const creatorsArray = value ? JSON.parse(value) : [];
        setFormData(prev => ({ ...prev, [name]: creatorsArray }));
      } catch (e) {
        console.error("Error parsing creators JSON:", e);
        setFormData(prev => ({ ...prev, [name]: [] }));
      }
    } else {
      // Handle UUID fields consistently - if value is empty or "null", set to null instead of empty string
      if (
        (name === "service_id" || 
        name === "status_id" || 
        name === "editorial_line_id" || 
        name === "product_id" || 
        name === "collaborator_id") && 
        (value === "" || value === "null")
      ) {
        // For service_id, which is required, keep the current value if an event is selected
        if (name === "service_id" && currentSelectedEvent) {
          // Don't change the service_id value
          console.log("Keeping existing service_id for required field");
        } else {
          setFormData(prev => ({ ...prev, [name]: null }));
        }
      } else {
        setFormData(prev => ({ ...prev, [name]: value === "null" ? null : value }));
      }
    }
    
    // Reset the flag after a short delay
    setTimeout(() => {
      isUserEditing.current = false;
    }, 100);
  };

  // Add the handleDateChange function
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

  return {
    currentSelectedEvent,
    formData,
    resetForm,
    handleSelectEvent,
    handleInputChange,
    handleSelectChange,
    handleDateChange
  };
}
