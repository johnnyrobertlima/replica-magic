
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Separacao = {
  id: string;
  cliente_nome: string;
  cliente_codigo: number;
  quantidade_itens: number;
  valor_total: number;
  status: string;
  created_at: string;
};

type SeparacaoItem = {
  id: string;
  pedido: string;
  item_codigo: string;
  descricao: string | null;
  quantidade_pedida: number;
  valor_unitario: number;
  valor_total: number;
};

const AprovacaoFinanceira = () => {
  const [expandedSeparacoes, setExpandedSeparacoes] = useState<Set<string>>(new Set());

  const { data: separacoes = [], isLoading } = useQuery({
    queryKey: ['separacoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('separacoes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Separacao[];
    }
  });

  const toggleExpand = (id: string) => {
    setExpandedSeparacoes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleAprovar = async (id: string) => {
    const { error } = await supabase
      .from('separacoes')
      .update({ status: 'aprovado' })
      .eq('id', id);

    if (error) {
      console.error('Erro ao aprovar separação:', error);
      return;
    }
  };

  const handleReprovar = async (id: string) => {
    const { error } = await supabase
      .from('separacoes')
      .update({ status: 'reprovado' })
      .eq('id', id);

    if (error) {
      console.error('Erro ao reprovar separação:', error);
      return;
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/client-area" className="inline-flex items-center gap-2 mb-6 text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Voltar para Área do Cliente
      </Link>

      <div className="space-y-4">
        {separacoes.map((separacao) => (
          <Card key={separacao.id}>
            <CardContent className="p-6">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleExpand(separacao.id)}
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">Cliente: {separacao.cliente_nome}</h3>
                  <p className="text-sm text-muted-foreground">
                    Quantidade de Itens: {separacao.quantidade_itens}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Valor Total: {formatCurrency(separacao.valor_total)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-green-500 text-white hover:bg-green-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAprovar(separacao.id);
                    }}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Aprovar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-red-500 text-white hover:bg-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReprovar(separacao.id);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reprovar
                  </Button>
                  {expandedSeparacoes.has(separacao.id) ? (
                    <ChevronUp className="h-6 w-6 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
              </div>

              {expandedSeparacoes.has(separacao.id) && (
                <SeparacaoDetails id={separacao.id} />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const SeparacaoDetails = ({ id }: { id: string }) => {
  const { data: itens = [] } = useQuery({
    queryKey: ['separacao-itens', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('separacao_itens')
        .select('*')
        .eq('separacao_id', id);

      if (error) throw error;
      return data as SeparacaoItem[];
    }
  });

  return (
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
            {itens.map((item) => (
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
    </div>
  );
};

export default AprovacaoFinanceira;
