
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useSeparacoes } from "@/hooks/useSeparacoes";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

const AprovacaoFinanceira = () => {
  const { data: separacoes = [], isLoading } = useSeparacoes();
  const { toast } = useToast();
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Filtra apenas as separações pendentes
  const separacoesPendentes = separacoes.filter(sep => sep.status === 'pendente');

  const toggleCard = (id: string) => {
    setExpandedCards(current => {
      const newSet = new Set(current);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleAprovar = (id: string) => {
    // Aqui você pode adicionar a lógica de aprovação
    toast({
      title: "Sucesso",
      description: "Pedido aprovado com sucesso!",
      variant: "default",
    });
  };

  const handleReprovar = (id: string) => {
    // Aqui você pode adicionar a lógica de reprovação
    toast({
      title: "Aviso",
      description: "Pedido reprovado!",
      variant: "destructive",
    });
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <Link to="/client-area" className="inline-flex items-center gap-2 mb-6 text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Voltar para Área do Cliente
      </Link>

      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Aprovação Financeira</h1>
        <p className="text-muted-foreground">
          Gerencie as aprovações financeiras dos pedidos.
        </p>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {separacoesPendentes.length > 0 ? (
              separacoesPendentes.map((separacao) => (
                <Card key={separacao.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Cliente: {separacao.cliente_nome}</CardTitle>
                        <CardDescription>
                          Valor Total: {separacao.valor_total.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          })}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCard(separacao.id)}
                      >
                        {expandedCards.has(separacao.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>

                  {expandedCards.has(separacao.id) && (
                    <CardContent>
                      <div className="space-y-4">
                        <h4 className="font-semibold">Itens do Pedido</h4>
                        <div className="space-y-2">
                          {separacao.itens?.map((item, index) => (
                            <div key={index} className="border rounded p-3">
                              <p className="font-medium">{item.item_codigo} - {item.descricao}</p>
                              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                <p>Quantidade: {item.quantidade_pedida}</p>
                                <p>Valor Unitário: {item.valor_unitario.toLocaleString('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL'
                                })}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  )}

                  <CardFooter className="flex justify-end gap-2">
                    <Button
                      variant="destructive"
                      onClick={() => handleReprovar(separacao.id)}
                    >
                      Reprovar
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => handleAprovar(separacao.id)}
                    >
                      Aprovar
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">
                      Nenhum pedido pendente de aprovação financeira.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
      <Toaster />
    </main>
  );
};

export default AprovacaoFinanceira;
