
export interface TituloFinanceiro {
  PES_CODIGO: string | number;
  VLRTITULO: number;
  VLRDESCONTO: number;
  VLRABATIMENTO: number;
  VLRSALDO: number;
  DTVENCIMENTO: string;
  DTVENCTO?: string; // Make this optional since we're only using DTVENCIMENTO
  STATUS: string;
}

export interface ClienteFinanceiro {
  PES_CODIGO: number;
  APELIDO: string | null;
  volume_saudavel_faturamento: number | null;
  valoresTotais: number;
  valoresEmAberto: number;
  valoresVencidos: number;
  separacoes: any[]; // Separações associadas a este cliente
  representanteNome: string | null; // Campo adicional para o nome do representante
  volumeSaudavel?: number | null; // Optional for backward compatibility
}
