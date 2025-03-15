
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Ban, CreditCard, Wallet } from "lucide-react";

interface ClienteFinanceiroInfoProps {
  valoresTotais: number;
  valoresEmAberto: number;
  valoresVencidos: number;
  volumeSaudavel: number | null;
  fatorCorrecao?: number | null;
}

export const ClienteFinanceiroInfo = ({ 
  valoresTotais, 
  valoresEmAberto, 
  valoresVencidos, 
  volumeSaudavel,
  fatorCorrecao
}: ClienteFinanceiroInfoProps) => {
  // Apply factor correction if it exists and is greater than 0
  const factor = fatorCorrecao && fatorCorrecao > 0 ? fatorCorrecao : 1;
  
  // Apply the correction factor to all monetary values
  const valoresTotaisCorrigidos = valoresTotais * factor;
  const valoresEmAbertoCorrigidos = valoresEmAberto * factor;
  const valoresVencidosCorrigidos = valoresVencidos * factor;
  
  return (
    <div className="bg-slate-50 p-4 rounded-lg border">
      <h3 className="font-semibold text-lg mb-3">
        Informações Financeiras
        {fatorCorrecao && fatorCorrecao > 0 && fatorCorrecao !== 1 && (
          <span className="ml-2 text-xs text-blue-500 font-medium">
            (Fator de Correção: {fatorCorrecao}x)
          </span>
        )}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-3 rounded-lg border space-y-1.5 shadow-sm">
          <span className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Wallet className="h-4 w-4 text-blue-500" />
            Valores Totais
          </span>
          <p className="font-medium text-lg">{formatCurrency(valoresTotaisCorrigidos)}</p>
        </div>
        
        <div className="bg-white p-3 rounded-lg border space-y-1.5 shadow-sm">
          <span className="text-sm text-muted-foreground flex items-center gap-1.5">
            <CreditCard className="h-4 w-4 text-amber-500" />
            Valores em Aberto
          </span>
          <p className="font-medium text-lg">{formatCurrency(valoresEmAbertoCorrigidos)}</p>
        </div>
        
        <div className="bg-white p-3 rounded-lg border space-y-1.5 shadow-sm">
          <span className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Ban className="h-4 w-4 text-red-500" />
            Valores Vencidos
          </span>
          <p className={`font-medium text-lg ${valoresVencidosCorrigidos > 0 ? "text-red-500" : ""}`}>
            {formatCurrency(valoresVencidosCorrigidos)}
          </p>
        </div>
        
        <div className="bg-white p-3 rounded-lg border space-y-1.5 shadow-sm">
          <span className="text-sm text-muted-foreground flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-green-500" />
            Volume Saudável
          </span>
          <p className="font-medium text-lg">
            {volumeSaudavel 
              ? formatCurrency(volumeSaudavel) 
              : "Não definido"}
          </p>
        </div>
      </div>
    </div>
  );
};
