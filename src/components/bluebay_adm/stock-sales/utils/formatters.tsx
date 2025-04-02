
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const formatTableDate = (dateString: string | null) => {
  if (!dateString) return "-";
  try {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  } catch (e) {
    return "-";
  }
};

export const formatTableNumber = (num: number | null, decimals = 2) => {
  if (num === null || num === undefined) return "-";
  return num.toLocaleString('pt-BR', { 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

export const formatTablePercentage = (num: number | null) => {
  if (num === null || num === undefined) return "-";
  return `${num.toLocaleString('pt-BR', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}%`;
};
