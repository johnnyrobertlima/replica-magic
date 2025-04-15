
// Modify the OniAgenciaContentSchedule interface to make title optional
export interface OniAgenciaContentSchedule {
  id: string;
  client_id: string;
  service_id: string;
  collaborator_id: string | null;
  title: string | null; // Change from string to string | null
  description: string | null;
  scheduled_date: string;
  execution_phase: string | null;
  editorial_line_id: string | null;
  product_id: string | null;
  status_id: string | null;
  created_at: string;
  updated_at: string;
}

// Update ContentScheduleFormData accordingly
export type ContentScheduleFormData = Omit<OniAgenciaContentSchedule, 'id' | 'created_at' | 'updated_at'>
