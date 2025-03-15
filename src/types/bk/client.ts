
export interface BkClient {
  PES_CODIGO: number;
  CATEGORIA?: string | null;
  NOME_CATEGORIA?: string | null;
  RAZAOSOCIAL?: string | null;
  CNPJCPF?: string | null;
  APELIDO?: string | null;
  INSCRICAO_ESTADUAL?: string | null;
  CEP?: string | null;
  ENDERECO?: string | null;
  NUMERO?: string | null;
  COMPLEMENTO?: string | null;
  BAIRRO?: string | null;
  CIDADE?: string | null;
  UF?: string | null;
  TELEFONE?: string | null;
  EMAIL?: string | null;
  DATACADASTRO?: string | null;
  volume_saudavel_faturamento?: number | null;
  empresas?: string[];
  fator_correcao?: number | null;
}
