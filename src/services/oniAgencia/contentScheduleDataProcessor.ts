
import { ContentScheduleFormData } from "@/types/oni-agencia";

export const sanitizeScheduleData = (schedule: ContentScheduleFormData | Partial<ContentScheduleFormData>) => {
  const processedSchedule = { ...schedule };
  
  // Ensure title is never null or empty
  if ('title' in processedSchedule && (!processedSchedule.title || processedSchedule.title === "")) {
    processedSchedule.title = " ";
  }
  
  // Ensure service_id is never null as it's required
  if ('service_id' in processedSchedule) {
    if (processedSchedule.service_id === "" || processedSchedule.service_id === null) {
      delete processedSchedule.service_id;
    }
  }
  
  // Ensure creators is always an array
  if ('creators' in processedSchedule) {
    if (!Array.isArray(processedSchedule.creators)) {
      processedSchedule.creators = processedSchedule.creators ? [processedSchedule.creators] : [];
    }
  }
  
  // Ensure UUID fields are null, not empty strings
  const uuidFields = ['status_id', 'editorial_line_id', 'product_id', 'collaborator_id'];
  uuidFields.forEach(field => {
    if (field in processedSchedule && processedSchedule[field] === "") {
      processedSchedule[field] = null;
    }
  });
  
  return processedSchedule;
};
