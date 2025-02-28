
import { useState, useEffect, useCallback } from "react";
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
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [hiddenCards, setHiddenCards] = useState<Set<string>>(new Set());
  const [clientesFinanceiros, setClientesFinanceiros] = useState<ClienteFinanceiro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [volumeSaudavelValue, setVolumeSaudavelValue] = useState<string>("");
  const [clienteEditando, setClienteEditando] = useState<number | null>(null);

  // Log para debugging
  useEffect(() => {
    console.log("Separações carregadas:", separacoes);
    console.log("Cards expandidos:", Array.from(expandedCards));
  }, [separacoes, expandedCards]);

  // Memoize o cálculo das separações pendentes para evitar recálculos desnecessários
  const getSeparacoesPendentes = useCallback(() => {
    const pendentes = separacoes
      .filter(sep => sep.status === 'pendente')
      .filter(sep => !hiddenCards.has(sep.id));
    
    console.log("Separações pendentes:", pendentes.length);
    return pendentes;
  }, [separacoes, hiddenCards]);

  // Use o useCallback para estabilizar a função que obtém os códigos dos clientes
  const getClientesCodigos = useCallback((sepPendentes: any[]) => {
    const codigos = sepPendentes
      .map(sep => sep.cliente_codigo)
      .filter((value, index, self) => self.indexOf(value) === index);
    
    console.log("Códigos de clientes únicos:", codigos);
    return codigos;
  }, []);

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setIsLoading(true);
        console.log("Iniciando busca de dados financeiros");
        
        // Obter as separações pendentes usando a função memoizada
        const separacoesPendentes = getSeparacoesPendentes();
        
        // Obter os códigos dos clientes
        const clientesCodigos = getClientesCodigos(separacoesPendentes);

        if (clientesCodigos.length === 0) {
          console.log("Nenhum cliente encontrado. Resetando clientes financeiros.");
          setClientesFinanceiros([]);
          setIsLoading(false);
          return;
        }

        // Buscar todos os títulos financeiros dos clientes com separações pendentes
        // Filtrar apenas os títulos com STATUS 1, 2 ou 3
        console.log("Buscando títulos financeiros para clientes:", clientesCodigos);
        const { data: titulos, error: titulosError } = await supabase
          .from('BLUEBAY_TITULO')
          .select('*')
          .in('PES_CODIGO', clientesCodigos.map(String))
          .in('STATUS', ['1', '2', '3']);

        if (titulosError) throw titulosError;
        console.log("Títulos encontrados:", titulos?.length || 0);

        // Buscar informações dos clientes com separações pendentes
        console.log("Buscando informações dos clientes");
        const { data: clientes, error: clientesError } = await supabase
          .from('BLUEBAY_PESSOA')
          .select('PES_CODIGO, APELIDO, volume_saudavel_faturamento')
          .in('PES_CODIGO', clientesCodigos);

        if (clientesError) throw clientesError;
        console.log("Clientes encontrados:", clientes?.length || 0);

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
              
              console.log(`Cliente ${cliente.PES_CODIGO} tem ${clienteSeparacoes.length} separações`);
              
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
        console.log("Total de clientes financeiros:", clientesArray.length);
        
        // Log detalhado de cada cliente e suas separações
        clientesArray.forEach(cliente => {
          console.log(`Cliente ${cliente.PES_CODIGO} (${cliente.APELIDO}):`, {
            valoresTotais: cliente.valoresTotais,
            valoresEmAberto: cliente.valoresEmAberto,
            valoresVencidos: cliente.valoresVencidos,
            separacoes: cliente.separacoes.length
          });
          
          cliente.separacoes.forEach(sep => {
            console.log(`  Separação ${sep.id}:`, {
              valor_total: sep.valor_total,
              itens: sep.separacao_itens?.length || 0
            });
          });
        });
        
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
        console.log("Busca de dados financeiros concluída");
      }
    };

    fetchFinancialData();
  }, [getSeparacoesPendentes, getClientesCodigos, toast]);

  const toggleCard = (id: string, e?: React.MouseEvent) => {
    // Previne o comportamento padrão do link (navegar para outra página)
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log("Toggling card:", id);
    
    setExpandedCards(current => {
      const newSet = new Set(current);
      if (newSet.has(id)) {
        console.log("Removendo card dos expandidos:", id);
        newSet.delete(id);
      } else {
        console.log("Adicionando card aos expandidos:", id);
        newSet.add(id);
      }
      return newSet;
    });
  };

  const hideCard = (id: string) => {
    console.log("Escondendo card:", id);
    setHiddenCards(current => {
      const newSet = new Set(current);
      newSet.add(id);
      return newSet;
    });
  };

  const handleAprovar = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("Aprovando separação:", id);
    // Aqui você pode adicionar a lógica de aprovação
    toast({
      title: "Sucesso",
      description: "Pedido aprovado com sucesso!",
      variant: "default",
    });
    hideCard(id);
  };

  const handleReprovar = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("Reprovando separação:", id);
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
    
    console.log("Atualizando volume saudável para cliente:", clienteEditando);
    
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
      
      console.log("Volume saudável atualizado com sucesso");
      
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

  console.log("Renderizando AprovacaoFinanceira com", clientesFinanceiros.length, "clientes");

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
              console.log(`Renderizando card para cliente ${cliente.PES_CODIGO} com ${cliente.separacoes.length} separações`);
              
              return (
                <Card 
                  key={cliente.PES_CODIGO} 
                  className={`overflow-hidden transition-all duration-300 ${
                    expandedCards.size > 0 && !expandedCards.has(`cliente-${cliente.PES_CODIGO}`) 
                      ? "md:hidden" 
                      : ""
                  } ${
                    expandedCards.has(`cliente-${cliente.PES_CODIGO}`) 
                      ? "md:col-span-2" 
                      : ""
                  }`}
                >
                  <CardHeader>
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={(e) => toggleCard(`cliente-${cliente.PES_CODIGO}`, e)}
                    >
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
                              onClick={(e) => {
                                e.stopPropagation(); // Prevenir que o clique propague para o toggle do card
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
                          <DialogContent onClick={(e) => e.stopPropagation()}>
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
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCard(`cliente-${cliente.PES_CODIGO}`, e);
                          }}
                        >
                          {expandedCards.has(`cliente-${cliente.PES_CODIGO}`) ? (
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
                          console.log(`Renderizando separação ${separacao.id}, expandido: ${expandedCards.has(separacao.id)}`);
                          return (
                            <div key={separacao.id} className="relative border rounded-lg">
                              <div 
                                className="p-4 cursor-pointer"
                                onClick={(e) => toggleCard(separacao.id, e)}
                              >
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <p className="font-medium">Valor Total: {formatCurrency(separacao.valor_total)}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Criado em: {new Date(separacao.created_at).toLocaleDateString('pt-BR')}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Representante: {separacao.representante_nome || "Não informado"}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleCard(separacao.id, e);
                                    }}
                                  >
                                    {expandedCards.has(separacao.id) ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>

                                {expandedCards.has(separacao.id) && (
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
                                        {separacao.separacao_itens?.map((item, index) => (
                                          <TableRow key={`${item.id}-${index}`}>
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

                                <div className="flex justify-end gap-2 mt-4">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={(e) => handleReprovar(separacao.id, e)}
                                  >
                                    Reprovar
                                  </Button>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={(e) => handleAprovar(separacao.id, e)}
                                  >
                                    Aprovar
                                  </Button>
                                </div>
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
