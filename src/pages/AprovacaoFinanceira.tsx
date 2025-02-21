
import { useSeparacoes } from "@/hooks/useSeparacoes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const AprovacaoFinanceira = () => {
  const { separacoes, isLoading, updateSeparacaoStatus } = useSeparacoes();

  const handleAprovar = async (id: string) => {
    try {
      await updateSeparacaoStatus.mutateAsync({ id, status: 'aprovado' });
      toast.success('Separação aprovada com sucesso!');
    } catch (error) {
      toast.error('Erro ao aprovar separação');
    }
  };

  const handleReprovar = async (id: string) => {
    try {
      await updateSeparacaoStatus.mutateAsync({ id, status: 'reprovado' });
      toast.success('Separação reprovada com sucesso!');
    } catch (error) {
      toast.error('Erro ao reprovar separação');
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
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

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Aprovação Financeira</h1>
          <p className="text-muted-foreground mt-2">
            Aprove ou reprove as separações de pedidos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {separacoes.map((separacao) => (
            <Card key={separacao.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  Cliente: {separacao.cliente_nome}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Quantidade de Itens:</p>
                      <p className="font-medium">{separacao.quantidade_itens}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valor Total:</p>
                      <p className="font-medium">{formatCurrency(separacao.valor_total)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status:</p>
                      <p className="font-medium capitalize">{separacao.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Data:</p>
                      <p className="font-medium">
                        {new Date(separacao.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  {separacao.status === 'pendente' && (
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleAprovar(separacao.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                        Aprovar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleReprovar(separacao.id)}
                      >
                        <XCircle className="h-4 w-4" />
                        Reprovar
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {separacoes.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="p-6 text-center text-muted-foreground">
                Nenhuma separação encontrada
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
};

export default AprovacaoFinanceira;
