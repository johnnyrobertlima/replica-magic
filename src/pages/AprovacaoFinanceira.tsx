
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useSeparacoes } from "@/hooks/useSeparacoes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const AprovacaoFinanceira = () => {
  const [expandedSeparacoes, setExpandedSeparacoes] = useState<Set<string>>(new Set());
  const { separacoes, isLoading, updateSeparacaoStatus } = useSeparacoes();

  const toggleExpand = (separacaoId: string) => {
    setExpandedSeparacoes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(separacaoId)) {
        newSet.delete(separacaoId);
      } else {
        newSet.add(separacaoId);
      }
      return newSet;
    });
  };

  const handleStatusUpdate = async (id: string, status: 'aprovado' | 'reprovado') => {
    try {
      await updateSeparacaoStatus.mutateAsync({ id, status });
      toast.success(`Separação ${status === 'aprovado' ? 'aprovada' : 'reprovada'} com sucesso!`);
    } catch (error) {
      toast.error('Erro ao atualizar status da separação');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Link to="/client-area" className="inline-flex items-center gap-2 mb-6 text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Voltar para Área do Cliente
      </Link>

      <h1 className="text-2xl font-bold mb-6">Aprovação Financeira</h1>

      <div className="grid gap-4">
        {separacoes.filter(s => s.status === 'pendente').map((separacao) => {
          const isExpanded = expandedSeparacoes.has(separacao.id);

          return (
            <Card key={separacao.id} className={cn("overflow-hidden")}>
              <CardContent className="p-6">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleExpand(separacao.id)}
                >
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">Cliente: {separacao.cliente_nome}</h3>
                    <p className="text-sm text-muted-foreground">
                      Qt. de Itens Separados: {separacao.quantidade_itens}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Valor da Separação: {separacao.valor_total.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-6 w-6 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>

                {isExpanded && (
                  <div className="mt-6">
                    <div className="rounded-lg border overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-2">Pedido</th>
                            <th className="text-left p-2">SKU</th>
                            <th className="text-left p-2">Descrição</th>
                            <th className="text-right p-2">Qt. Pedida</th>
                            <th className="text-right p-2">Valor Unit.</th>
                            <th className="text-right p-2">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {separacao.itens?.map((item) => (
                            <tr key={item.id} className="border-t">
                              <td className="p-2">{item.pedido}</td>
                              <td className="p-2">{item.item_codigo}</td>
                              <td className="p-2">{item.descricao || '-'}</td>
                              <td className="p-2 text-right">{item.quantidade_pedida}</td>
                              <td className="p-2 text-right">
                                {item.valor_unitario.toLocaleString('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL'
                                })}
                              </td>
                              <td className="p-2 text-right">
                                {item.valor_total.toLocaleString('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL'
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-end gap-4 mt-4">
                      <Button
                        variant="outline"
                        onClick={() => handleStatusUpdate(separacao.id, 'reprovado')}
                      >
                        Reprovar
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(separacao.id, 'aprovado')}
                      >
                        Aprovar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
};

export default AprovacaoFinanceira;
