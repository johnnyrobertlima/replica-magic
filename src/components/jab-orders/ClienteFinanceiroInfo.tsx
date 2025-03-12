
import { formatCurrency } from "@/lib/utils";

interface ClienteFinanceiroInfoProps {
  valoresTotais: number;
  valoresEmAberto: number;
  valoresVencidos: number;
  volumeSaudavel: number | null;
}

export const ClienteFinanceiroInfo = ({ 
  valoresTotais, 
  valoresEmAberto, 
  valoresVencidos, 
  volumeSaudavel 
}: ClienteFinanceiroInfoProps) => {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-2">Informações Financeiras</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <span className="text-sm text-muted-foreground">Valores Totais</span>
          <p className="font-medium">{formatCurrency(valoresTotais)}</p>
        </div>
        <div className="space-y-1">
          <span className="text-sm text-muted-foreground">Valores em Aberto</span>
          <p className="font-medium">{formatCurrency(valoresEmAberto)}</p>
        </div>
        <div className="space-y-1">
          <span className="text-sm text-muted-foreground">Valores Vencidos</span>
          <p className={`font-medium ${valoresVencidos > 0 ? 'text-red-500' : ''}`}>
            {formatCurrency(valoresVencidos)}
          </p>
        </div>
        <div className="space-y-1">
          <span className="text-sm text-muted-foreground">Volume Saudável</span>
          <p className="font-medium">
            {volumeSaudavel 
              ? formatCurrency(volumeSaudavel) 
              : "Não definido"}
          </p>
        </div>
      </div>
    </div>
  );
};
