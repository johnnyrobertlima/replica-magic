
import { fetchTitulosVencidos } from "@/utils/financialUtils";

// Fetch títulos vencidos for a specific client
export const fetchValoresVencidos = async (clienteCodigo: number) => {
  console.log(`Buscando valores vencidos para cliente ${clienteCodigo}`);
  const result = await fetchTitulosVencidos(clienteCodigo);
  console.log(`Resultado da busca: ${result}`);
  return result;
};
