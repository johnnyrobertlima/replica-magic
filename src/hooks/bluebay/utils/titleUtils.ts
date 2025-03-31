
import { FinancialTitle, ClientInfo } from "../types/financialTypes";
import { getClientName, pesCodigoToNumber } from "./clientDataUtils";

// Process a financial title with client information
export const processFinancialTitle = (
  titulo: any,
  clientesMap: Map<number, ClientInfo>
): FinancialTitle => {
  const pesCodigoAsNumber = pesCodigoToNumber(titulo.PES_CODIGO);
  
  // Get client info from the map
  const clienteInfo = clientesMap.get(pesCodigoAsNumber);
  const clientName = getClientName(clienteInfo);
  
  return {
    NUMNOTA: titulo.NUMNOTA,
    DTEMISSAO: titulo.DTEMISSAO,
    DTVENCIMENTO: titulo.DTVENCIMENTO || titulo.DTVENCTO,
    DTPAGTO: titulo.DTPAGTO,
    VLRDESCONTO: titulo.VLRDESCONTO || 0,
    VLRTITULO: titulo.VLRTITULO || 0,
    VLRSALDO: titulo.VLRSALDO || 0,
    STATUS: titulo.STATUS,
    PES_CODIGO: titulo.PES_CODIGO,
    CLIENTE_NOME: clientName,
  };
};
