
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
