
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
    // Update internal state when external expandedView prop changes
    setIsExpanded(expandedView);
  }, [expandedView]);

  const createdAt = new Date(separacao.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const toggleExpand = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    
    if (onExpandToggle) {
      onExpandToggle(separacao.id, newExpandedState);
    }
  };

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
              type="button"
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

          {isExpanded && separacao.separacao_itens && separacao.separacao_itens.length > 0 && (
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
                  {separacao.separacao_itens.map((item) => (
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
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
