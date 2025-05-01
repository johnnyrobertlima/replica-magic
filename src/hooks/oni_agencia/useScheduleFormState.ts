
import { useState, useEffect } from "react";
import { CalendarEvent, ContentScheduleFormData } from "@/types/oni-agencia";
import { format } from "date-fns";

export const useScheduleFormState = ({
  clientId,
  selectedDate,
  selectedEvent
}: {
  clientId: string;
  selectedDate: Date;
  selectedEvent?: CalendarEvent;
}) => {
  const [currentSelectedEvent, setCurrentSelectedEvent] = useState<CalendarEvent | null>(null);
  const [formData, setFormData] = useState<ContentScheduleFormData>({
    client_id: clientId,
    service_id: "",
    collaborator_id: null,
    title: null,
    description: null,
    scheduled_date: format(selectedDate, "yyyy-MM-dd"),
    execution_phase: null,
    editorial_line_id: null,
    product_id: null,
    status_id: null,
    creators: null,
    capture_date: null // Add capture_date field
  });
  
  // Effect for selectedEvent from props
  useEffect(() => {
    if (selectedEvent) {
      console.log("useScheduleFormState selectedEvent effect:", selectedEvent.id);
      handleSelectEvent(selectedEvent);
    }
  }, [selectedEvent]);
  
  // Effect for clientId
  useEffect(() => {
    if (clientId !== formData.client_id) {
      setFormData(prev => ({ ...prev, client_id: clientId }));
    }
  }, [clientId, formData.client_id]);
  
  // Effect for selectedDate
  useEffect(() => {
    if (selectedDate) {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      if (formattedDate !== formData.scheduled_date) {
        setFormData(prev => ({ ...prev, scheduled_date: formattedDate }));
      }
    }
  }, [selectedDate, formData.scheduled_date]);
  
  const resetForm = () => {
    setCurrentSelectedEvent(null);
    setFormData({
      client_id: clientId,
      service_id: "",
      collaborator_id: null,
      title: null,
      description: null,
      scheduled_date: format(selectedDate, "yyyy-MM-dd"),
      execution_phase: null,
      editorial_line_id: null,
      product_id: null,
      status_id: null,
      creators: null,
      capture_date: null // Add capture_date field
    });
  };
  
  const handleSelectEvent = (event: CalendarEvent) => {
    console.log("selecting event in useScheduleFormState:", event.id);
    
    // Ensure creators is handled properly
    let creators = event.creators;
    if (typeof creators === 'string') {
      try {
        creators = JSON.parse(creators);
      } catch (e) {
        creators = [creators]; // Convert to array if parsing fails
      }
    }
    
    setCurrentSelectedEvent(event);
    setFormData({
      client_id: event.client_id,
      service_id: event.service_id,
      collaborator_id: event.collaborator_id,
      title: event.title,
      description: event.description,
      scheduled_date: event.scheduled_date,
      execution_phase: event.execution_phase,
      editorial_line_id: event.editorial_line_id,
      product_id: event.product_id,
      status_id: event.status_id,
      creators: creators,
      capture_date: event.capture_date // Add capture_date field
    });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    console.log("Select changed:", name, value);
    
    // Special case for empty client_id, service_id
    if ((name === 'client_id' || name === 'service_id') && !value) {
      // Don't allow empty values for these required fields
      console.log(`Keeping existing ${name} for required field`);
      return;
    }
    
    // Special handling for creators
    if (name === 'creators') {
      try {
        const parsedValue = JSON.parse(value);
        setFormData((prev) => ({ ...prev, [name]: parsedValue }));
      } catch (e) {
        console.error("Error parsing creators JSON:", e);
        setFormData((prev) => ({ ...prev, [name]: [] }));
      }
      return;
    }
    
    // Normalize null values for empty strings
    const normalizedValue = value === "" ? null : value;
    setFormData((prev) => ({ ...prev, [name]: normalizedValue }));
  };
  
  const handleDateChange = (name: string, value: Date | null) => {
    if (value) {
      const formattedDate = format(value, "yyyy-MM-dd");
      setFormData(prev => ({ ...prev, [name]: formattedDate }));
    } else {
      setFormData(prev => ({ ...prev, [name]: null }));
    }
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
};
