
import { useState, useEffect, useCallback } from "react";
import { useSeparacoes } from "@/hooks/useSeparacoes";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TituloFinanceiro {
  PES_CODIGO: string | number;
  VLRTITULO: number;
  VLRDESCONTO: number;
  VLRABATIMENTO: number;
  VLRSALDO: number;
  DTVENCIMENTO: string;
  STATUS: string;
}

export interface ClienteFinanceiro {
  PES_CODIGO: number;
  APELIDO: string | null;
  volume_saudavel_faturamento: number | null;
  valoresTotais: number;
  valoresEmAberto: number;
  valoresVencidos: number;
  separacoes: any[]; // Separações associadas a este cliente
  representanteNome: string | null; // Campo adicional para o nome do representante
}

export const useClientesFinanceiros = () => {
  const { data: separacoes = [], isLoading: isLoadingSeparacoes } = useSeparacoes();
  const { toast } = useToast();
  const [clientesFinanceiros, setClientesFinanceiros] = useState<ClienteFinanceiro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hiddenCards, setHiddenCards] = useState<Set<string>>(new Set());

  // Get separações pendentes
  const getSeparacoesPendentes = useCallback(() => {
    const pendentes = separacoes
      .filter(sep => sep.status === 'pendente')
      .filter(sep => !hiddenCards.has(sep.id));
    
    return pendentes;
  }, [separacoes, hiddenCards]);

  // Get unique client codes
  const getClientesCodigos = useCallback((sepPendentes: any[]) => {
    const codigos = sepPendentes
      .map(sep => sep.cliente_codigo)
      .filter((value, index, self) => self.indexOf(value) === index);
    
    return codigos;
  }, []);

  // Hide a card
  const hideCard = (id: string) => {
    setHiddenCards(current => {
      const newSet = new Set(current);
      newSet.add(id);
      return newSet;
    });
  };

  // Update volume saudavel
  const updateVolumeSaudavel = async (clienteCodigo: number, valor: number) => {
    try {
      const { error } = await supabase
        .from('BLUEBAY_PESSOA')
        .update({ volume_saudavel_faturamento: valor })
        .eq('PES_CODIGO', clienteCodigo);
      
      if (error) throw error;
      
      // Update local state
      setClientesFinanceiros(prev => 
        prev.map(cliente => 
          cliente.PES_CODIGO === clienteCodigo
            ? { ...cliente, volume_saudavel_faturamento: valor } 
            : cliente
        )
      );
      
      return { success: true };
    } catch (error) {
      console.error("Erro ao atualizar volume saudável:", error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setIsLoading(true);
        
        const separacoesPendentes = getSeparacoesPendentes();
        const clientesCodigos = getClientesCodigos(separacoesPendentes);

        if (clientesCodigos.length === 0) {
          setClientesFinanceiros([]);
          setIsLoading(false);
          return;
        }

        // Fetch financial titles
        const { data: titulos, error: titulosError } = await supabase
          .from('BLUEBAY_TITULO')
          .select('*')
          .in('PES_CODIGO', clientesCodigos.map(String))
          .in('STATUS', ['1', '2', '3']);

        if (titulosError) throw titulosError;

        // Fetch client info
        const { data: clientes, error: clientesError } = await supabase
          .from('BLUEBAY_PESSOA')
          .select('PES_CODIGO, APELIDO, volume_saudavel_faturamento')
          .in('PES_CODIGO', clientesCodigos);

        if (clientesError) throw clientesError;

        // Fetch pedidos to get REPRESENTANTE codes
        const representantesCodigos = new Set<number>();
        const clienteToRepresentanteMap = new Map<number, number>();

        // Get unique pedido numbers from separações
        const numeroPedidos = separacoesPendentes
          .flatMap(sep => sep.separacao_itens.map((item: any) => item.pedido))
          .filter((value, index, self) => self.indexOf(value) === index);

        if (numeroPedidos.length > 0) {
          const { data: pedidos, error: pedidosError } = await supabase
            .from('BLUEBAY_PEDIDO')
            .select('PED_NUMPEDIDO, REPRESENTANTE')
            .eq('CENTROCUSTO', 'JAB')
            .in('PED_NUMPEDIDO', numeroPedidos);

          if (pedidosError) throw pedidosError;

          if (pedidos && pedidos.length > 0) {
            // Map each cliente to their representante
            pedidos.forEach(pedido => {
              if (pedido.REPRESENTANTE) {
                representantesCodigos.add(pedido.REPRESENTANTE);
                
                // Find the separação with this pedido
                separacoesPendentes.forEach(sep => {
                  if (sep.separacao_itens.some((item: any) => item.pedido === pedido.PED_NUMPEDIDO)) {
                    clienteToRepresentanteMap.set(sep.cliente_codigo, pedido.REPRESENTANTE);
                  }
                });
              }
            });
          }
        }

        // Fetch representantes info
        const representantesInfo = new Map<number, string>();
        if (representantesCodigos.size > 0) {
          const { data: representantes, error: representantesError } = await supabase
            .from('BLUEBAY_PESSOA')
            .select('PES_CODIGO, RAZAOSOCIAL')
            .in('PES_CODIGO', Array.from(representantesCodigos));

          if (representantesError) throw representantesError;

          if (representantes) {
            representantes.forEach(rep => {
              representantesInfo.set(rep.PES_CODIGO, rep.RAZAOSOCIAL);
            });
          }
        }

        // Current date for comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Group titles by client
        const clientesMap = new Map<number, ClienteFinanceiro>();

        if (clientes) {
          clientes.forEach(cliente => {
            if (cliente.PES_CODIGO) {
              // Find separations for this client
              const clienteSeparacoes = separacoesPendentes.filter(
                sep => sep.cliente_codigo === cliente.PES_CODIGO
              );
              
              // Get representante for this cliente
              const representanteCodigo = clienteToRepresentanteMap.get(cliente.PES_CODIGO);
              const representanteNome = representanteCodigo ? representantesInfo.get(representanteCodigo) || null : null;
              
              clientesMap.set(cliente.PES_CODIGO, {
                PES_CODIGO: cliente.PES_CODIGO,
                APELIDO: cliente.APELIDO,
                volume_saudavel_faturamento: cliente.volume_saudavel_faturamento,
                valoresTotais: 0,
                valoresEmAberto: 0,
                valoresVencidos: 0,
                separacoes: clienteSeparacoes,
                representanteNome: representanteNome
              });
            }
          });
        }

        // Calculate values for each client
        if (titulos) {
          titulos.forEach((titulo: TituloFinanceiro) => {
            const pesCodigoNumerico = typeof titulo.PES_CODIGO === 'string' 
              ? parseInt(titulo.PES_CODIGO, 10) 
              : titulo.PES_CODIGO;
            
            if (isNaN(pesCodigoNumerico) || !clientesMap.has(pesCodigoNumerico)) return;

            const cliente = clientesMap.get(pesCodigoNumerico)!;
            
            // Total values = VLRTITULO - VLRDESCONTO - VLRABATIMENTO
            const valorTotal = (titulo.VLRTITULO || 0) - (titulo.VLRDESCONTO || 0) - (titulo.VLRABATIMENTO || 0);
            cliente.valoresTotais += valorTotal;
            
            // Open values = VLRSALDO
            cliente.valoresEmAberto += (titulo.VLRSALDO || 0);
            
            // Overdue values = VLRSALDO of overdue titles
            if (titulo.DTVENCIMENTO) {
              const vencimento = new Date(titulo.DTVENCIMENTO);
              if (vencimento < today) {
                cliente.valoresVencidos += (titulo.VLRSALDO || 0);
              }
            }
          });
        }

        // Convert map to array
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

  return {
    clientesFinanceiros,
    isLoading,
    isLoadingSeparacoes,
    hideCard,
    updateVolumeSaudavel
  };
};
