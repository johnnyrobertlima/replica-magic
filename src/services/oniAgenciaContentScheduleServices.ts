
// Import and re-export getContentSchedules function
import { getContentSchedules } from "./oniAgencia/getContentSchedules";
// Import and re-export getAllContentSchedules function from its own file
import { getAllContentSchedules } from "./oniAgencia/getAllContentSchedules";
// Import and re-export paginadas versions
import { getContentSchedulesPaginated } from "./oniAgencia/getContentSchedulesPaginated";
import { getAllContentSchedulesPaginated } from "./oniAgencia/getAllContentSchedulesPaginated";
// Import and re-export mutation functions
import { 
  createContentSchedule,
  updateContentSchedule, 
  deleteContentSchedule 
} from "./oniAgencia/contentScheduleMutations";

// Export all functions
export {
  getContentSchedules,
  getAllContentSchedules,
  getContentSchedulesPaginated,
  getAllContentSchedulesPaginated,
  createContentSchedule,
  updateContentSchedule,
  deleteContentSchedule
};
