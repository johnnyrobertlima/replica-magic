
import { FileText } from "lucide-react";

interface PedidosIncluidosProps {
  approvedSeparacao: any;
}

export const PedidosIncluidos = ({ approvedSeparacao }: PedidosIncluidosProps) => {
  if (!approvedSeparacao.separacao_itens_flat || approvedSeparacao.separacao_itens_flat.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
        <FileText className="h-4 w-4" /> 
        Pedidos incluídos:
      </h4>
      <div className="flex flex-wrap gap-2">
        {Array.from(
          new Set(
            approvedSeparacao.separacao_itens_flat
              .filter(item => item && item.pedido)
              .map(item => item.pedido)
          )
        ).map((pedido, index) => (
          <span key={`pedido-${index}`} className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
            {String(pedido)}
          </span>
        ))}
      </div>
    </div>
  );
};
