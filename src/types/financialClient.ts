
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
  
  // Add all other BLUEBAY_PESSOA fields as optional to avoid type errors
  BAIRRO?: string | null;
  CATEGORIA?: string | null;
  CEP?: string | null;
  CIDADE?: string | null;
  CNPJCPF?: string | null;
  COMPLEMENTO?: string | null;
  DATACADASTRO?: string | null;
  EMAIL?: string | null;
  ENDERECO?: string | null;
  INSCRICAO_ESTADUAL?: string | null;
  NOME_CATEGORIA?: string | null;
  NUMERO?: string | null;
  RAZAOSOCIAL?: string | null;
  TELEFONE?: string | null;
  UF?: string | null;
}
