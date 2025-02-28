
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

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
  expandedView?: boolean;
  onExpandToggle?: (id: string, expanded: boolean) => void;
}

export const SeparacaoCard = ({ separacao, expandedView = false, onExpandToggle }: SeparacaoCardProps) => {
  const [isExpanded, setIsExpanded] = useState(expandedView);
  
  useEffect(() => {
    console.log("SeparacaoCard montado para separação:", separacao.id);
    console.log("Estado inicial de expansão:", isExpanded);
    
    return () => {
      console.log("SeparacaoCard desmontado para separação:", separacao.id);
    };
  }, [separacao.id, isExpanded]);

  const createdAt = new Date(separacao.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const toggleExpand = (e: React.MouseEvent) => {
    // Garantir que o comportamento padrão seja prevenido
    e.preventDefault();
    e.stopPropagation();
    
    const newExpandedState = !isExpanded;
    console.log("Toggling card expansion:", separacao.id, "New state:", newExpandedState);
    setIsExpanded(newExpandedState);
    
    if (onExpandToggle) {
      onExpandToggle(separacao.id, newExpandedState);
    }
  };

  console.log("Renderizando SeparacaoCard:", separacao.id, "Expandido:", isExpanded);
  console.log("Número de itens na separação:", separacao.separacao_itens?.length || 0);

  return (
    <Card className={`overflow-hidden transition-all duration-300 ${expandedView ? 'col-span-full' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{separacao.cliente_nome}</h3>
            <p className="text-sm text-muted-foreground">Criado em: {createdAt}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs capitalize ${
              separacao.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' : 
              separacao.status === 'em_separacao' ? 'bg-blue-100 text-blue-800' : 
              'bg-green-100 text-green-800'
            }`}>
              {separacao.status.replace('_', ' ')}
            </span>
            <Button
              variant="ghost"
              size="sm"
              type="button" // Importante para evitar submissão de formulário acidental
              onClick={toggleExpand}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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

          {isExpanded && (
            <div className="rounded-lg border overflow-x-auto mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead className="text-right">Valor Unit.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {separacao.separacao_itens.map((item) => {
                    console.log("Renderizando item:", item.id, item.item_codigo);
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.pedido}</TableCell>
                        <TableCell className="font-medium">{item.item_codigo}</TableCell>
                        <TableCell>{item.descricao || '-'}</TableCell>
                        <TableCell className="text-right">{item.quantidade_pedida}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.valor_unitario)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.valor_total)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
