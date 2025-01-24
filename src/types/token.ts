export interface Token {
  id: string;
  NomedoChip: string | null;
  "limite por dia": number | null;
  Telefone: number | null;
  cliente: string | null;
  Status: string | null;
}

export interface TokenFormData {
  id: string;
  NomedoChip: string;
  limitePorDia: string;
  Telefone: string;
  cliente: string;
  Status: string;
}