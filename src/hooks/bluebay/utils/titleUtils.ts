
import { ClientInfo, FinancialTitle } from "../types/financialTypes";

/**
 * Processa e formata um título financeiro adicionando informações do cliente
 * e garantindo a formatação correta de todos os campos
 */
export const processFinancialTitle = (
  titulo: any, 
  clientesMap: Record<string | number, ClientInfo>
): FinancialTitle => {
  // Recuperar o código do cliente, garantindo que seja uma string
  const pesCodigoKey = typeof titulo.PES_CODIGO === 'string' ? 
    titulo.PES_CODIGO : String(titulo.PES_CODIGO);
  
  // Buscar informações do cliente no mapa
  const clienteInfo = clientesMap[pesCodigoKey];

  // Tratar o número do documento para garantir que zeros à esquerda e espaços sejam preservados
  const numdocumento = titulo.NUMDOCUMENTO ? String(titulo.NUMDOCUMENTO).trim() : null;
  
  return {
    MATRIZ: titulo.MATRIZ || 0,
    FILIAL: titulo.FILIAL || 0,
    NUMLCTO: titulo.NUMLCTO || 0,
    ANOBASE: titulo.ANOBASE || 0,
    DTEMISSAO: titulo.DTEMISSAO,
    DTVENCIMENTO: titulo.DTVENCIMENTO || titulo.DTVENCTO,
    DTPAGTO: titulo.DTPAGTO,
    VLRABATIMENTO: titulo.VLRABATIMENTO || 0,
    VLRDESCONTO: titulo.VLRDESCONTO || 0,
    VLRTITULO: titulo.VLRTITULO || 0,
    VLRSALDO: titulo.VLRSALDO || 0,
    TIPO: titulo.TIPO || '',
    STATUS: titulo.STATUS,
    PES_CODIGO: titulo.PES_CODIGO,
    NUMNOTA: titulo.NUMNOTA,
    CLIENTE_NOME: clienteInfo ? 
      (clienteInfo.RAZAOSOCIAL || clienteInfo.APELIDO || "Cliente sem nome") : 
      "Cliente não encontrado",
    NUMDOCUMENTO: numdocumento
  };
};

/**
 * Formata o número do documento para exibição na interface
 * Preserva zeros à esquerda e remove caracteres invisíveis
 */
export const formatNumDocumento = (numdocumento: string | null | undefined): string => {
  if (!numdocumento) return '-';
  
  // Remove caracteres invisíveis e espaços no início e fim
  const cleanedDoc = numdocumento.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
  
  if (!cleanedDoc) return '-';
  
  return cleanedDoc;
};
