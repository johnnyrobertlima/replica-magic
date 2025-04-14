
// Content Schedule Types
export interface OniAgenciaContentSchedule {
  id: string;
  client_id: string;
  service_id: string;
  collaborator_id: string | null;
  title: string | null; 
  description: string | null;
  scheduled_date: string;
  execution_phase: string | null;
  editorial_line_id: string | null;
  product_id: string | null;
  status_id: string | null;
  created_at: string;
  updated_at: string;
}

export type ContentScheduleFormData = Omit<OniAgenciaContentSchedule, 'id' | 'created_at' | 'updated_at'>

// Calendar Event Type (extended from OniAgenciaContentSchedule with related entities)
export interface CalendarEvent extends OniAgenciaContentSchedule {
  service: {
    id: string;
    name: string;
    category?: string;
    color: string;
  };
  collaborator?: {
    id: string;
    name: string;
    email?: string;
    photo_url?: string;
  };
  editorial_line?: {
    id: string;
    name: string;
    symbol?: string;
    color?: string;
  };
  product?: {
    id: string;
    name: string;
    symbol?: string;
    color?: string;
  };
  status?: {
    id: string;
    name: string;
    color?: string;
  };
}

// Client Types
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

// Service Types
export interface OniAgenciaService {
  id: string;
  name: string;
  description: string;
  category: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export type ServiceFormData = Omit<OniAgenciaService, 'id' | 'created_at' | 'updated_at'>

// Collaborator Types
export interface OniAgenciaCollaborator {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

export type CollaboratorFormData = Omit<OniAgenciaCollaborator, 'id' | 'created_at' | 'updated_at'>

// Client Scope Types
export interface ClientScope {
  id: string;
  client_id: string;
  service_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export type ClientScopeFormData = Omit<ClientScope, 'id' | 'created_at' | 'updated_at'>
