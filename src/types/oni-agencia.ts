
// Modify the OniAgenciaContentSchedule interface to make scheduled_date optional when capture_date is present
export interface OniAgenciaContentSchedule {
  id: string;
  client_id: string;
  service_id: string;
  collaborator_id: string | null;
  title: string | null; 
  description: string | null;
  scheduled_date: string | null; // Permanece como string no modelo de dados da API
  execution_phase: string | null;
  editorial_line_id: string | null;
  product_id: string | null;
  status_id: string | null;
  creators: string[] | null;
  created_at: string;
  updated_at: string;
  capture_date: string | null;
  capture_end_date: string | null;
  is_all_day: boolean | null;
  location: string | null;
}

// Update ContentScheduleFormData to properly handle Date objects for date fields
export interface ContentScheduleFormData {
  client_id: string;
  service_id: string;
  collaborator_id: string | null;
  title: string | null; 
  description: string | null;
  scheduled_date: Date | null;  // Sempre Date ou null durante a vida do formulário
  execution_phase: string | null;
  editorial_line_id: string | null;
  product_id: string | null;
  status_id: string | null;
  creators: string[] | null;
  capture_date: Date | null;  // Sempre Date ou null durante a vida do formulário
  capture_end_date: Date | null;  // Sempre Date ou null durante a vida do formulário
  is_all_day: boolean | null;
  location: string | null;
}

// Add missing types for OniAgenciaClient
export interface OniAgenciaClient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  logo_url: string | null;
  cnpj: string | null;
  address: string | null;
  city: string | null;
  cep: string | null;
  created_at: string;
  updated_at: string;
}

export type ClientFormData = Omit<OniAgenciaClient, 'id' | 'created_at' | 'updated_at'>

// Add missing types for OniAgenciaCollaborator
export interface OniAgenciaCollaborator {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export type CollaboratorFormData = Omit<OniAgenciaCollaborator, 'id' | 'created_at' | 'updated_at'>

// Add missing types for OniAgenciaService
export interface OniAgenciaService {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export type ServiceFormData = Omit<OniAgenciaService, 'id' | 'created_at' | 'updated_at'>

// Add missing types for ClientScope
export interface ClientScope {
  id: string;
  client_id: string;
  service_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export type ClientScopeFormData = Omit<ClientScope, 'id' | 'created_at' | 'updated_at'>

// Add CalendarEvent type for the content schedule calendar
export interface CalendarEvent extends OniAgenciaContentSchedule {
  service?: {
    id: string;
    name: string;
    category: string | null;
    color: string | null;
  } | null;
  collaborator?: {
    id: string;
    name: string;
    email: string | null;
    photo_url: string | null;
  } | null;
  editorial_line?: {
    id: string;
    name: string;
    symbol: string | null;
    color: string | null;
  } | null;
  product?: {
    id: string;
    name: string;
    symbol: string | null;
    color: string | null;
  } | null;
  status?: {
    id: string;
    name: string;
    color: string | null;
  } | null;
  client?: {
    id: string;
    name: string;
  } | null;
}
