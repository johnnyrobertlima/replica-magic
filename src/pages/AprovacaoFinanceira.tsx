import { useState, useEffect } from "react";
import { useClienteFinanceiro } from "@/hooks/useClientesFinanceiros";
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SeparacaoDePedidos } from "@/components/SeparacaoDePedidos";
import { ClienteFinanceiro } from "@/types/financialClient";
import { fetchTitulosVencidos } from "@/utils/financialUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/utils/currencyUtils";

interface Titulo {
  BOL_CODIGO: number;
  BOL_DATAEMISSAO: string;
  BOL_DATAVENCIMENTO: string;
  BOL_VALOR: number;
  BOL_SITUACAO: string;
}

const AprovacaoFinanceira = () => {
  const router = useRouter();
  const { clienteId } = router.query;
  const [cliente, setCliente] = useState<ClienteFinanceiro | null>(null);
  const [titulosVencidos, setTitulosVencidos] = useState<Titulo[] | null>(null);
  const { data, isLoading, isError } = useClienteFinanceiro(clienteId as string);
  const [showSeparacaoPedidos, setShowSeparacaoPedidos] = useState(false);

  useEffect(() => {
    if (data) {
      setCliente(data);
    }
  }, [data]);

  useEffect(() => {
    const loadTitulosVencidos = async () => {
      if (clienteId) {
        try {
          const titulos = await fetchTitulosVencidos(clienteId);
          setTitulosVencidos(titulos);
        } catch (error) {
          console.error("Erro ao carregar títulos vencidos:", error);
        }
      }
    };

    loadTitulosVencidos();
  }, [clienteId]);

  const handleGoBack = () => {
    router.back();
  };

  const handleAprovarCliente = () => {
    alert('Cliente Aprovado!');
  };

  const handleReprovarCliente = () => {
    alert('Cliente Reprovado!');
  };

  const handleShowSeparacaoPedidos = () => {
    setShowSeparacaoPedidos(true);
  };

  const handleCloseSeparacaoPedidos = () => {
    setShowSeparacaoPedidos(false);
  };

  const columns = [
    {
      accessorKey: 'BOL_CODIGO',
      header: 'Código',
    },
    {
      accessorKey: 'BOL_DATAEMISSAO',
      header: 'Data de Emissão',
      cell: ({ row }) => format(new Date(row.BOL_DATAEMISSAO), 'dd/MM/yyyy', { locale: ptBR }),
    },
    {
      accessorKey: 'BOL_DATAVENCIMENTO',
      header: 'Data de Vencimento',
      cell: ({ row }) => format(new Date(row.BOL_DATAVENCIMENTO), 'dd/MM/yyyy', { locale: ptBR }),
    },
    {
      accessorKey: 'BOL_VALOR',
      header: 'Valor',
      cell: ({ row }) => formatCurrency(row.BOL_VALOR),
    },
    {
      accessorKey: 'BOL_SITUACAO',
      header: 'Situação',
    },
  ];

  if (isLoading) return <div>Carregando...</div>;
  if (isError) return <div>Erro ao carregar dados.</div>;
  if (!cliente) return <div>Cliente não encontrado.</div>;

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleGoBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <CardTitle>Aprovação Financeira do Cliente</CardTitle>
          </div>
          <CardDescription>Detalhes financeiros e ações para o cliente.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Código do Cliente</p>
              <p>{cliente.PES_CODIGO}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Nome do Cliente</p>
              <p>{cliente.APELIDO}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Limite de Crédito</p>
              <p>{formatCurrency(cliente.LIMITE_CREDITO)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Total em Aberto</p>
              <p>{formatCurrency(cliente.valoresEmAberto)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Total Vencido</p>
              <p>{formatCurrency(cliente.valoresVencidos)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Total Pago</p>
              <p>{formatCurrency(cliente.valoresTotais)}</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Títulos Vencidos</h2>
            {titulosVencidos && titulosVencidos.length > 0 ? (
              <DataTable columns={columns} data={titulosVencidos} />
            ) : (
              <Badge variant="secondary">Nenhum título vencido encontrado.</Badge>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button onClick={handleShowSeparacaoPedidos}>
              Liberar Separação de Pedidos
            </Button>
            <Button variant="secondary" onClick={handleReprovarCliente}>
              Reprovar Cliente
            </Button>
            <Button onClick={handleAprovarCliente}>Aprovar Cliente</Button>
          </div>
        </CardContent>
      </Card>

      {showSeparacaoPedidos && (
        <SeparacaoDePedidos clienteId={cliente.PES_CODIGO} onClose={handleCloseSeparacaoPedidos} />
      )}
    </div>
  );
};

export default AprovacaoFinanceira;
