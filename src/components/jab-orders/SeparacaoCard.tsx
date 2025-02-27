
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Truck, Package, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SeparacaoCardProps {
  separacao: {
    id: string;
    cliente_nome: string;
    status: string;
    created_at: string;
    valor_total: number;
    quantidade_itens: number;
    separacao_itens: Array<{
      id: string;
      item_codigo: string;
      descricao: string | null;
      quantidade_pedida: number;
      valor_unitario: number;
      valor_total: number;
      pedido: string;
    }>;
  };
}

export const SeparacaoCard = ({ separacao }: SeparacaoCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const createdAt = new Date(separacao.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Clock className="h-4 w-4" />;
      case 'em_separacao':
        return <Package className="h-4 w-4" />;
      case 'separado':
        return <CheckCircle className="h-4 w-4" />;
      case 'em_entrega':
        return <Truck className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'em_separacao':
        return 'bg-blue-100 text-blue-800';
      case 'separado':
        return 'bg-green-100 text-green-800';
      case 'em_entrega':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    return status.replace('_', ' ');
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{separacao.cliente_nome}</h3>
            <p className="text-sm text-muted-foreground">Criado em: {createdAt}</p>
          </div>
          <Badge className={cn("flex items-center gap-1 capitalize", getStatusClass(separacao.status))}>
            {getStatusIcon(separacao.status)}
            {getStatusText(separacao.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Quantidade de Itens</p>
              <p className="font-medium">{separacao.quantidade_itens}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="font-medium">{formatCurrency(separacao.valor_total)}</p>
            </div>
          </div>

          {expanded && (
            <div className="space-y-2 mt-3">
              <p className="text-sm font-medium">Itens:</p>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {separacao.separacao_itens.map((item) => (
                  <div key={item.id} className="text-sm border rounded-md p-2 bg-gray-50">
                    <p className="font-medium">{item.descricao || item.item_codigo}</p>
                    <div className="flex justify-between text-muted-foreground mt-1">
                      <span>Pedido: {item.pedido}</span>
                      <span>{item.quantidade_pedida} un × {formatCurrency(item.valor_unitario)}</span>
                    </div>
                    <div className="flex justify-end mt-1">
                      <span className="font-medium">{formatCurrency(item.valor_total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-center">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full flex items-center justify-center gap-1 text-muted-foreground"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" /> 
              Ocultar itens
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" /> 
              Ver {separacao.separacao_itens.length} itens
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
