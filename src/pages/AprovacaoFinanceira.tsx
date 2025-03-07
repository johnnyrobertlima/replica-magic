
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, ChevronDown, ChevronUp, Edit } from "lucide-react";
import { useSeparacoes } from "@/hooks/useSeparacoes";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
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
import { SeparacaoCard } from "@/components/jab-orders/SeparacaoCard";

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
  separacoes: any[]; // Separações associadas a este cliente
}

const AprovacaoFinanceira = () => {
  const { data: separacoes = [], isLoading: isLoadingSeparacoes } = useSeparacoes();
  const { toast } = useToast();
  const [expandedCards, setExpandedCards] = useState<string[]>([]);
  const [hiddenCards, setHiddenCards] = useState<Set<string>>(new Set());
  const [clientesFinanceiros, setClientesFinanceiros] = useState<ClienteFinanceiro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [volumeSaudavelValue, setVolumeSaudavelValue] = useState<string>("");
  const [clienteEditando, setClienteEditando] = useState<number | null>(null);

  // Memoize o cálculo das separações pendentes para evitar recálculos desnecessários
  const getSeparacoesPendentes = useCallback(() => {
    const pendentes = separacoes
      .filter(sep => sep.status === 'pendente')
      .filter(sep => !hiddenCards.has(sep.id));
    
    return pendentes;
  }, [separacoes, hiddenCards]);

  // Use o useCallback para estabilizar a função que obtém os códigos dos clientes
  const getClientesCodigos = useCallback((sepPendentes: any[]) => {
    const codigos = sepPendentes
      .map(sep => sep.cliente_codigo)
      .filter((value, index, self) => self.indexOf(value) === index);
    
    return codigos;
  }, []);

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setIsLoading(true);
        
        // Obter as separações pendentes usando a função memoizada
        const separacoesPendentes = getSeparacoesPendentes();
        
        // Obter os códigos dos clientes
        const clientesCodigos = getClientesCodigos(separacoesPendentes);

        if (clientesCodigos.length === 0) {
          setClientesFinanceiros([]);
          setIsLoading(false);
          return;
        }

        // Buscar todos os títulos financeiros dos clientes com separações pendentes
        // Filtrar apenas os títulos com STATUS 1, 2 ou 3
        const { data: titulos, error: titulosError } = await supabase
          .from('BLUEBAY_TITULO')
          .select('*')
          .in('PES_CODIGO', clientesCodigos.map(String))
          .in('STATUS', ['1', '2', '3']);

        if (titulosError) throw titulosError;

        // Buscar informações dos clientes com separações pendentes
        const { data: clientes, error: clientesError } = await supabase
          .from('BLUEBAY_PESSOA')
          .select('PES_CODIGO, APELIDO, volume_saudavel_faturamento')
          .in('PES_CODIGO', clientesCodigos);

        if (clientesError) throw clientesError;

        // Data atual para comparação de vencimentos
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Agrupar os títulos por cliente
        const clientesMap = new Map<number, ClienteFinanceiro>();

        if (clientes) {
          clientes.forEach(cliente => {
            if (cliente.PES_CODIGO) {
              // Encontrar as separações deste cliente
              const clienteSeparacoes = separacoesPendentes.filter(
                sep => sep.cliente_codigo === cliente.PES_CODIGO
              );
              
              clientesMap.set(cliente.PES_CODIGO, {
                PES_CODIGO: cliente.PES_CODIGO,
                APELIDO: cliente.APELIDO,
                volume_saudavel_faturamento: cliente.volume_saudavel_faturamento,
                valoresTotais: 0,
                valoresEmAberto: 0,
                valoresVencidos: 0,
                separacoes: clienteSeparacoes
              });
            }
          });
        }

        // Calcular os valores para cada cliente
        if (titulos) {
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
        }

        // Converter mapa para array
        const clientesArray = Array.from(clientesMap.values());
        
        setClientesFinanceiros(clientesArray);
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
  }, [getSeparacoesPendentes, getClientesCodigos, toast]);

  // Função para alternar a expansão dos cards
  const handleExpandToggle = (id: string, expanded: boolean) => {
    setExpandedCards(current => {
      if (expanded && !current.includes(id)) {
        return [...current, id];
      } else if (!expanded && current.includes(id)) {
        return current.filter(cardId => cardId !== id);
      }
      return current;
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
        
        <h2 className="text-2xl font-bold mt-8">Pedidos Pendentes de Aprovação</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clientesFinanceiros.length > 0 ? (
            clientesFinanceiros.map((cliente) => {
              const clienteId = `cliente-${cliente.PES_CODIGO}`;
              const isExpanded = expandedCards.includes(clienteId);
              
              return (
                <Card 
                  key={cliente.PES_CODIGO} 
                  className={`overflow-hidden transition-all duration-300 ${
                    expandedCards.length > 0 && !isExpanded
                      ? "md:hidden" 
                      : ""
                  } ${
                    isExpanded 
                      ? "md:col-span-2" 
                      : ""
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{cliente.APELIDO || `Cliente ${cliente.PES_CODIGO}`}</CardTitle>
                        <CardDescription>
                          Representante: {cliente.APELIDO || `Cliente ${cliente.PES_CODIGO}`}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => {
                                setClienteEditando(cliente.PES_CODIGO);
                                setVolumeSaudavelValue(
                                  cliente.volume_saudavel_faturamento 
                                    ? cliente.volume_saudavel_faturamento.toString().replace('.', ',') 
                                    : ""
                                );
                              }}
                            >
                              <Edit className="h-3 w-3" />
                              <span>Volume Saudável</span>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={() => handleExpandToggle(clienteId, !isExpanded)}
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
                  
                  <CardContent className="space-y-6">
                    {/* Informações Financeiras */}
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Informações Financeiras</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">Valores Totais</span>
                          <p className="font-medium">{formatCurrency(cliente.valoresTotais)}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">Valores em Aberto</span>
                          <p className="font-medium">{formatCurrency(cliente.valoresEmAberto)}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">Valores Vencidos</span>
                          <p className="font-medium text-red-500">{formatCurrency(cliente.valoresVencidos)}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">Volume Saudável</span>
                          <p className="font-medium">
                            {cliente.volume_saudavel_faturamento 
                              ? formatCurrency(cliente.volume_saudavel_faturamento) 
                              : "Não definido"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Pedidos do Cliente */}
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Pedidos Pendentes</h3>
                      <div className="space-y-4">
                        {cliente.separacoes.map(separacao => {
                          const isExpanded = expandedCards.includes(separacao.id);
                          
                          return (
                            <div key={separacao.id} className="relative border rounded-lg">
                              <SeparacaoCard 
                                separacao={separacao} 
                                expandedView={isExpanded}
                                onExpandToggle={handleExpandToggle}
                              />
                              
                              <div className="flex justify-end gap-2 p-4 border-t">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  type="button"
                                  onClick={() => handleReprovar(separacao.id)}
                                >
                                  Reprovar
                                </Button>
                                <Button
                                  variant="default"
                                  size="sm"
                                  type="button"
                                  onClick={() => handleAprovar(separacao.id)}
                                >
                                  Aprovar
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="col-span-2">
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  Nenhum pedido pendente de aprovação financeira.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Toaster />
    </main>
  );
};

export default AprovacaoFinanceira;
