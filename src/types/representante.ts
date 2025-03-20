
export interface Representante {
  codigo_representante: number;
  nome_representante: string;
}

export interface UserRepresentante {
  id: string;
  user_id: string;
  codigo_representante: number;
  created_at: string;
}

export interface UserRepresentanteWithDetails extends UserRepresentante {
  user_email?: string;
  nome_representante?: string;
}
