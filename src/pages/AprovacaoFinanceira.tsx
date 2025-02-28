
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, ChevronDown, ChevronUp, Edit } from "lucide-react";
import { useSeparacoes } from "@/hooks/useSeparacoes";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TituloFinanceiro {
  PES_CODIGO: string | number;
  VLRTITULO: number;
  VLRDESCONTO: number;
  VLRABATIMENTO: number;
  VLRSALDO: number;
  DTVENCIMENTO: string;
  STATUS: string;
}

interface ClienteFinanceiro {
  PES_CODIGO: number;
  APELIDO: string | null;
  volume_saudavel_faturamento: number | null;
  valoresTotais: number;
  valoresEmAberto: number;
  valoresVencidos: number;
}

const AprovacaoFinanceira = () => {
  const { data: separacoes = [], isLoading: isLoadingSeparacoes } = useSeparacoes();
  const { toast } = useToast();
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [hiddenCards, setHiddenCards] = useState<Set<string>>(new Set());
  const [clientesFinanceiros, setClientesFinanceiros] = useState<ClienteFinanceiro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [volumeSaudavelValue, setVolumeSaudavelValue] = useState<string>("");
  const [clienteEditando, setClienteEditando] = useState<number | null>(null);

  // Filtra apenas as separações pendentes e não ocultas
  const separacoesPendentes = separacoes
    .filter(sep => sep.status === 'pendente')
    .filter(sep => !hiddenCards.has(sep.id));

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setIsLoading(true);

        // Buscar todos os títulos financeiros
        const { data: titulos, error: titulosError } = await supabase
          .from('BLUEBAY_TITULO')
          .select('*');

        if (titulosError) throw titulosError;

        // Buscar informações dos clientes
        const { data: clientes, error: clientesError } = await supabase
          .from('BLUEBAY_PESSOA')
          .select('PES_CODIGO, APELIDO, volume_saudavel_faturamento');

        if (clientesError) throw clientesError;

        // Data atual para comparação de vencimentos
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Agrupar os títulos por cliente
        const clientesMap = new Map<number, ClienteFinanceiro>();

        clientes.forEach(cliente => {
          if (cliente.PES_CODIGO) {
            clientesMap.set(cliente.PES_CODIGO, {
              PES_CODIGO: cliente.PES_CODIGO,
              APELIDO: cliente.APELIDO,
              volume_saudavel_faturamento: cliente.volume_saudavel_faturamento,
              valoresTotais: 0,
              valoresEmAberto: 0,
              valoresVencidos: 0
            });
          }
        });

        // Calcular os valores para cada cliente
        titulos.forEach((titulo: TituloFinanceiro) => {
          const pesCodigoNumerico = typeof titulo.PES_CODIGO === 'string' 
            ? parseInt(titulo.PES_CODIGO, 10) 
            : titulo.PES_CODIGO;
          
          if (isNaN(pesCodigoNumerico) || !clientesMap.has(pesCodigoNumerico)) return;

          const cliente = clientesMap.get(pesCodigoNumerico)!;
          
          // Valores Totais = Soma da coluna VLRTITULO - VLRDESCONTO - VLRABATIMENTO
          const valorTotal = (titulo.VLRTITULO || 0) - (titulo.VLRDESCONTO || 0) - (titulo.VLRABATIMENTO || 0);
          cliente.valoresTotais += valorTotal;
          
          // Valores em Aberto = Soma da coluna VLRSALDO
          cliente.valoresEmAberto += (titulo.VLRSALDO || 0);
          
          // Valores Vencidos = Soma da coluna VLRSALDO de títulos vencidos
          if (titulo.DTVENCIMENTO) {
            const vencimento = new Date(titulo.DTVENCIMENTO);
            if (vencimento < today) {
              cliente.valoresVencidos += (titulo.VLRSALDO || 0);
            }
          }
        });

        // Converter mapa para array
        setClientesFinanceiros(Array.from(clientesMap.values()));
      } catch (error) {
        console.error("Erro ao buscar dados financeiros:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados financeiros.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinancialData();
  }, [toast]);

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

  const hideCard = (id: string) => {
    setHiddenCards(current => {
      const newSet = new Set(current);
      newSet.add(id);
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
    hideCard(id);
  };

  const handleReprovar = (id: string) => {
    // Aqui você pode adicionar a lógica de reprovação
    toast({
      title: "Aviso",
      description: "Pedido reprovado!",
      variant: "destructive",
    });
    hideCard(id);
  };

  const handleVolumeSaudavelSubmit = async () => {
    if (!clienteEditando) return;
    
    try {
      const valorNumerico = parseFloat(volumeSaudavelValue.replace(/\./g, '').replace(',', '.'));
      
      if (isNaN(valorNumerico)) {
        toast({
          title: "Erro",
          description: "Por favor, insira um valor numérico válido.",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from('BLUEBAY_PESSOA')
        .update({ volume_saudavel_faturamento: valorNumerico })
        .eq('PES_CODIGO', clienteEditando);
      
      if (error) throw error;
      
      // Atualizar os dados locais
      setClientesFinanceiros(prev => 
        prev.map(cliente => 
          cliente.PES_CODIGO === clienteEditando 
            ? { ...cliente, volume_saudavel_faturamento: valorNumerico } 
            : cliente
        )
      );
      
      toast({
        title: "Sucesso",
        description: "Volume saudável de faturamento atualizado com sucesso!",
        variant: "default",
      });
      
      // Limpar o estado
      setClienteEditando(null);
      setVolumeSaudavelValue("");
    } catch (error) {
      console.error("Erro ao atualizar volume saudável:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o volume saudável de faturamento.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  if (isLoading || isLoadingSeparacoes) {
    return (
      <div className="flex items-center justify-center p-8">
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
        <h1 className="text-3xl font-bold">Aprovação Financeira</h1>
        <p className="text-muted-foreground">
          Gerencie as aprovações financeiras dos pedidos e monitore informações financeiras dos clientes.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientesFinanceiros.map((cliente) => (
            <Card key={cliente.PES_CODIGO} className="overflow-hidden">
              <CardHeader>
                <CardTitle>{cliente.APELIDO || `Cliente ${cliente.PES_CODIGO}`}</CardTitle>
                <CardDescription>
                  Código: {cliente.PES_CODIGO}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Valores Totais:</span>
                    <span className="font-medium">{formatCurrency(cliente.valoresTotais)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Valores em Aberto:</span>
                    <span className="font-medium">{formatCurrency(cliente.valoresEmAberto)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Valores Vencidos:</span>
                    <span className="font-medium text-red-500">{formatCurrency(cliente.valoresVencidos)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Volume Saudável de Faturamento:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">
                        {cliente.volume_saudavel_faturamento 
                          ? formatCurrency(cliente.volume_saudavel_faturamento) 
                          : "Não definido"}
                      </span>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => {
                              setClienteEditando(cliente.PES_CODIGO);
                              setVolumeSaudavelValue(
                                cliente.volume_saudavel_faturamento 
                                  ? cliente.volume_saudavel_faturamento.toString().replace('.', ',') 
                                  : ""
                              );
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Volume Saudável de Faturamento</DialogTitle>
                            <DialogDescription>
                              Defina o volume saudável de faturamento para {cliente.APELIDO || `Cliente ${cliente.PES_CODIGO}`}.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="volume-saudavel">Valor</Label>
                              <Input
                                id="volume-saudavel"
                                value={volumeSaudavelValue}
                                onChange={(e) => setVolumeSaudavelValue(e.target.value)}
                                placeholder="0,00"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button type="button" variant="secondary">Cancelar</Button>
                            </DialogClose>
                            <DialogClose asChild>
                              <Button type="button" onClick={handleVolumeSaudavelSubmit}>Salvar</Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <h2 className="text-2xl font-bold mt-8">Pedidos Pendentes de Aprovação</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {separacoesPendentes.length > 0 ? (
            separacoesPendentes.map((separacao) => (
              <Card key={separacao.id} className={expandedCards.has(separacao.id) ? "col-span-full" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle>Cliente: {separacao.cliente_nome}</CardTitle>
                      <CardDescription>
                        Valor Total: {separacao.valor_total.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                      </CardDescription>
                      <CardDescription>
                        Representante: {separacao.representante_nome}
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
                    <div className="rounded-lg border overflow-x-auto">
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
                          {separacao.separacao_itens?.map((item, index) => (
                            <TableRow key={`${item.item_codigo}-${index}`}>
                              <TableCell className="font-medium">{item.pedido}</TableCell>
                              <TableCell className="font-medium">{item.item_codigo}</TableCell>
                              <TableCell>{item.descricao}</TableCell>
                              <TableCell className="text-right">{item.quantidade_pedida}</TableCell>
                              <TableCell className="text-right">
                                {item.valor_unitario.toLocaleString('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL'
                                })}
                              </TableCell>
                              <TableCell className="text-right">
                                {(item.quantidade_pedida * item.valor_unitario).toLocaleString('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL'
                                })}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
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
      </div>
      <Toaster />
    </main>
  );
};

export default AprovacaoFinanceira;
