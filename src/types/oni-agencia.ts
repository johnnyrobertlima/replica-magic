
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
