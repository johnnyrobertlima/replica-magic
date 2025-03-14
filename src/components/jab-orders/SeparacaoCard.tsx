
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

  // Safe conversion of created_at to Date with fallback
  const createdAt = separacao && separacao.created_at
    ? new Date(separacao.created_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Data não disponível';

  const toggleExpand = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    
    if (onExpandToggle) {
      onExpandToggle(separacao.id, newExpandedState);
    }
  };

  // Safe access to status
  const statusDisplay = separacao && separacao.status 
    ? separacao.status.replace('_', ' ') 
    : 'pendente';

  // Determine status class safely
  const getStatusClass = () => {
    if (!separacao || !separacao.status) return 'bg-yellow-100 text-yellow-800';
    
    return separacao.status === 'pendente' 
      ? 'bg-yellow-100 text-yellow-800' 
      : separacao.status === 'em_separacao' 
        ? 'bg-blue-100 text-blue-800' 
        : 'bg-green-100 text-green-800';
  };

  return (
    <Card className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'col-span-full' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{separacao?.cliente_nome || 'Cliente não identificado'}</h3>
            <p className="text-sm text-muted-foreground">Criado em: {createdAt}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs capitalize ${getStatusClass()}`}>
              {statusDisplay}
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
              <p className="font-medium">{separacao?.quantidade_itens || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="font-medium">{formatCurrency(separacao?.valor_total || 0)}</p>
            </div>
          </div>

          {isExpanded && separacao?.separacao_itens && separacao.separacao_itens.length > 0 && (
            <div className="rounded-lg border overflow-x-auto mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Solicitado</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead className="text-right">Valor Unit.</TableHead>
                    <TableHead className="text-right">Falta Faturar</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {separacao.separacao_itens.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.pedido || '-'}</TableCell>
                      <TableCell className="font-medium">{item.item_codigo || '-'}</TableCell>
                      <TableCell>{item.descricao || '-'}</TableCell>
                      <TableCell className="text-right">{item.quantidade_pedida || 0}</TableCell>
                      {/* For now we'll just use quantidade_pedida as saldo too - this will be replaced in real data */}
                      <TableCell className="text-right">{item.quantidade_pedida || 0}</TableCell> 
                      <TableCell className="text-right">
                        {formatCurrency(item.valor_unitario || 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency((item.quantidade_pedida || 0) * (item.valor_unitario || 0))}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.valor_total || 0)}
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
