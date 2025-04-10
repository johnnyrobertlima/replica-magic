export interface OniAgenciaService {
  id: string;
  name: string;
  category: string;
  color: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export type ServiceFormData = Omit<OniAgenciaService, 'id' | 'created_at' | 'updated_at'>;

export interface OniAgenciaCollaborator {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export type CollaboratorFormData = Omit<OniAgenciaCollaborator, 'id' | 'created_at' | 'updated_at'>;

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

export type ClientFormData = Omit<OniAgenciaClient, 'id' | 'created_at' | 'updated_at'>;

export interface OniAgenciaContentSchedule {
  id: string;
  client_id: string;
  service_id: string;
  collaborator_id: string | null;
  title: string;
  description: string | null;
  scheduled_date: string;
  execution_phase: string | null;
  editorial_line_id: string | null;
  product_id: string | null;
  status_id: string | null;
  created_at: string;
  updated_at: string;
}

export type ContentScheduleFormData = Omit<OniAgenciaContentSchedule, 'id' | 'created_at' | 'updated_at'>;

export interface CalendarEvent extends OniAgenciaContentSchedule {
  service: {
    id: string;
    name: string;
    category: string;
    color: string;
    description?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  collaborator?: {
    id: string;
    name: string;
    email?: string | null;
    photo_url?: string | null;
  };
  editorial_line?: {
    id: string;
    name: string;
    symbol?: string | null;
    color?: string | null;
  };
  product?: {
    id: string;
    name: string;
    symbol?: string | null;
    color?: string | null;
  };
  status?: {
    id: string;
    name: string;
    color?: string | null;
  };
}

export interface ClientScope {
  id: string;
  client_id: string;
  service_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export type ClientScopeFormData = Omit<ClientScope, 'id' | 'created_at' | 'updated_at'>;
