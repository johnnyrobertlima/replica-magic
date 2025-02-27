
import { Card, CardHeader, CardContent } from "@/components/ui/card";
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
}

export const SeparacaoCard = ({ separacao }: SeparacaoCardProps) => {
  const createdAt = new Date(separacao.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{separacao.cliente_nome}</h3>
            <p className="text-sm text-muted-foreground">Criado em: {createdAt}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs capitalize ${
            separacao.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' : 
            separacao.status === 'em_separacao' ? 'bg-blue-100 text-blue-800' : 
            'bg-green-100 text-green-800'
          }`}>
            {separacao.status.replace('_', ' ')}
          </span>
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

          <div className="space-y-2">
            <p className="text-sm font-medium">Itens:</p>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {separacao.separacao_itens.map((item) => (
                <div key={item.id} className="text-sm border-b pb-2">
                  <p className="font-medium">{item.descricao || item.item_codigo}</p>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Pedido: {item.pedido}</span>
                    <span>{item.quantidade_pedida} un × {formatCurrency(item.valor_unitario)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
