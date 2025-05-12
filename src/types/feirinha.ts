
export interface NovoClienteFeirinha {
  id?: string;
  solicitante: string;
  nome_lojista: string;
  telefone_proprietario: string;
  corredor: string;
  numero_banca: string;
  data_inauguracao: string;
  observacao?: string;
  created_at?: string;
}

export interface NovoClienteFeirinhaFormData {
  solicitante: string;
  nome_lojista: string;
  telefone_proprietario: string;
  corredor: string;
  numero_banca: string;
  data_inauguracao: string;
  observacao: string;
}
